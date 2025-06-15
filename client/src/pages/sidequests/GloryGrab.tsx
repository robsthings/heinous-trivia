import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { heinousSprites } from '@/lib/characterLoader';

interface Vial {
  id: number;
  x: number;
  y: number;
  countdown: number;
  maxCountdown: number;
  isExploding: boolean;
  isCollected: boolean;
  vialType: number; // 1-4 for normal vials, 0 for empty decoy
  isEmpty: boolean; // true for decoy vials
}

interface GloryGrabProps {
  showHeinous?: boolean;
}

function GloryGrabCore({ showHeinous = true }: GloryGrabProps) {
  const [, navigate] = useLocation();
  const [gamePhase, setGamePhase] = useState<'title' | 'playing' | 'complete'>('title');
  const [vials, setVials] = useState<Vial[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [heinousMessage, setHeinousMessage] = useState('');
  const [showHeinousMessage, setShowHeinousMessage] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const vialIdCounter = useRef(0);

  const heinousReactions = {
    good: [
      "Impressive reflexes, worm!",
      "My precious vials! Nooo!",
      "Stop stealing my glory!",
      "Curse your nimble fingers!"
    ],
    bad: [
      "MELTDOWN! My laboratory!",
      "You incompetent fool!",
      "My experiments are ruined!",
      "Pathetic! Simply pathetic!"
    ],
    decoy: [
      "You fool! That was empty!",
      "Wasted effort, imbecile!",
      "Distracted by nothing!",
      "My decoys work perfectly!"
    ],
    start: [
      "Protect my precious experiments!",
      "Don't let them explode!",
      "Quick! Save my glory!"
    ],
    end: [
      "The carnage... it's beautiful!",
      "My lab will never recover!",
      "You've doomed us all!"
    ]
  };

  const showHeinousReaction = (type: keyof typeof heinousReactions) => {
    const reactions = heinousReactions[type];
    const message = reactions[Math.floor(Math.random() * reactions.length)];
    setHeinousMessage(message);
    setShowHeinousMessage(true);
    setTimeout(() => setShowHeinousMessage(false), 2500);
  };

  const getVialImage = (vial: Vial) => {
    if (vial.isEmpty) {
      return '/sidequests/glory-grab/vial-empty.png';
    }
    
    if (vial.isExploding) {
      return `/sidequests/glory-grab/vial-${vial.vialType}-exploding.png`;
    }
    
    // Show glowing when countdown is low (last 30% of time)
    if (vial.countdown / vial.maxCountdown < 0.3) {
      return `/sidequests/glory-grab/vial-${vial.vialType}-glowing.png`;
    }
    
    return `/sidequests/glory-grab/vial-${vial.vialType}-normal.png`;
  };

  const generateRandomPosition = () => {
    if (!gameAreaRef.current) return { x: 50, y: 50 };
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const margin = 80;
    
    return {
      x: Math.random() * (rect.width - margin * 2) + margin,
      y: Math.random() * (rect.height - margin * 2) + margin
    };
  };

  const createVial = useCallback(() => {
    if (gamePhase !== 'playing') return;
    
    const position = generateRandomPosition();
    const countdown = 2 + Math.random() * 2;
    
    // 20% chance for decoy vial
    const isEmpty = Math.random() < 0.2;
    const vialType = isEmpty ? 0 : Math.floor(Math.random() * 4) + 1; // 1-4 for normal, 0 for empty
    
    const newVial: Vial = {
      id: vialIdCounter.current++,
      x: position.x,
      y: position.y,
      countdown: countdown,
      maxCountdown: countdown,
      isExploding: false,
      isCollected: false,
      vialType: vialType,
      isEmpty: isEmpty
    };

    setVials(prev => [...prev, newVial]);
  }, [gamePhase]);

  const collectVial = (vialId: number) => {
    const vial = vials.find(v => v.id === vialId);
    if (!vial) return;
    
    setVials(prev => prev.map(v => 
      v.id === vialId ? { ...v, isCollected: true } : v
    ));
    
    if (vial.isEmpty) {
      // Decoy vial - no points, different reaction
      showHeinousReaction('decoy');
    } else {
      // Real vial - add points
      setScore(prev => prev + 10);
      showHeinousReaction('good');
    }
    
    setTimeout(() => {
      setVials(prev => prev.filter(v => v.id !== vialId));
    }, 300);
  };

  const explodeVial = (vialId: number) => {
    setVials(prev => prev.map(vial => 
      vial.id === vialId ? { ...vial, isExploding: true } : vial
    ));
    
    setTimeout(() => {
      setVials(prev => {
        const explodingCount = prev.filter(v => v.isExploding).length;
        if (explodingCount >= 3) {
          showHeinousReaction('bad');
        }
        return prev.filter(vial => vial.id !== vialId);
      });
    }, 500);
  };

  const startGame = () => {
    setGamePhase('playing');
    setScore(0);
    setTimeLeft(20);
    setVials([]);
    vialIdCounter.current = 0;
    showHeinousReaction('start');
  };

  const endGame = () => {
    setGamePhase('complete');
    setVials([]);
    showHeinousReaction('end');
  };

  const handleReturnToGame = () => {
    navigate('/game/headquarters');
  };

  // Game timer
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [gamePhase, timeLeft]);

  // Vial countdown timer
  useEffect(() => {
    if (gamePhase === 'playing') {
      const interval = setInterval(() => {
        setVials(prev => prev.map(vial => {
          if (vial.isCollected || vial.isExploding) return vial;
          
          const newCountdown = vial.countdown - 0.1;
          if (newCountdown <= 0) {
            explodeVial(vial.id);
            return vial;
          }
          return { ...vial, countdown: newCountdown };
        }));
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gamePhase]);

  // Spawn vials randomly during gameplay
  useEffect(() => {
    if (gamePhase === 'playing') {
      const spawnInterval = setInterval(() => {
        if (vials.length < 8) {
          createVial();
        }
      }, 1000 + Math.random() * 1500);
      
      return () => clearInterval(spawnInterval);
    }
  }, [gamePhase, vials.length, createVial]);

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: 'url(/sidequests/glory-grab/glory-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      
      {showHeinous && (
        <div className="absolute left-4 sm:left-8 z-20" style={{ top: 'calc(50% - 2rem)' }}>
          <div className="relative">
            {showHeinousMessage && (
              <div className="absolute -top-20 sm:-top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-red-600 rounded-lg px-3 py-2 w-48 sm:w-56 shadow-lg animate-fade-in z-10">
                <div className="text-red-400 text-xs sm:text-sm font-semibold text-center">
                  {heinousMessage}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-600"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
            
            <img
              src={heinousSprites.scheming}
              alt="Dr. Heinous"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl animate-sprite-idle-twitch"
              style={{ marginTop: '2rem' }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        
        {gamePhase === 'title' && (
          <div 
            className="w-full h-96 max-w-2xl mx-auto cursor-pointer animate-fade-in"
            onClick={startGame}
            style={{
              backgroundImage: 'url(/sidequests/glory-grab/glory-title.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {gamePhase === 'playing' && (
          <div 
            ref={gameAreaRef}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
              <div className="bg-black/70 rounded-lg px-4 py-2 flex gap-6 text-white">
                <div className="text-center">
                  <div className="text-xs text-gray-300">SCORE</div>
                  <div className="text-xl font-bold text-green-400">{score}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-300">TIME</div>
                  <div className="text-xl font-bold text-red-400">{timeLeft}s</div>
                </div>
              </div>
            </div>

            {vials.filter(v => v.isExploding).length >= 2 && (
              <div className="absolute inset-0 z-25 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-4xl font-bold animate-pulse">
                  MELTDOWN!
                </div>
              </div>
            )}

            {vials.map(vial => (
              <div
                key={vial.id}
                className={`absolute w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 cursor-pointer transform transition-all duration-300 ${
                  vial.isCollected ? 'scale-150 opacity-0' : 
                  vial.isExploding ? 'scale-150 opacity-0' : 
                  'scale-100 opacity-100 animate-bounce'
                }`}
                style={{
                  left: `${vial.x}px`,
                  top: `${vial.y}px`,
                  filter: vial.isExploding ? 'brightness(2) saturate(2) hue-rotate(0deg)' : 'none'
                }}
                onClick={() => !vial.isCollected && !vial.isExploding && collectVial(vial.id)}
              >
                <img
                  src={getVialImage(vial)}
                  alt={vial.isEmpty ? "Empty vial" : `Vial ${vial.vialType}`}
                  className="w-full h-full object-contain"
                  style={{
                    filter: vial.isExploding ? 'brightness(3) saturate(3) hue-rotate(0deg)' : 'none'
                  }}
                />
                
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div 
                    className="h-1.5 bg-red-500 rounded"
                    style={{
                      width: `${Math.max((vial.countdown / vial.maxCountdown) * 56, 4)}px`,
                      backgroundColor: vial.countdown > 1 ? '#10b981' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {gamePhase === 'complete' && (
          <div className="text-center animate-fade-in">
            <div className="bg-black/80 rounded-lg p-8 max-w-md mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-red-500 mb-4">
                EXPERIMENT COMPLETE!
              </h1>
              <div className="text-2xl font-bold text-green-400 mb-6">
                Final Score: {score}
              </div>
              <div className="text-gray-300 mb-8">
                {score >= 100 ? "Magnificent! You saved the lab!" :
                 score >= 50 ? "Not bad, but my vials are still smoking..." :
                 "Pathetic! My laboratory is in ruins!"}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={startGame}
                  className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 text-sm font-semibold w-full"
                >
                  Play Again
                </Button>
                
                <Button
                  onClick={handleReturnToGame}
                  variant="ghost"
                  className="text-gray-400 hover:text-white px-6 py-3 text-sm w-full"
                >
                  Return to Main Game
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GloryGrab() {
  return <GloryGrabCore />;
}