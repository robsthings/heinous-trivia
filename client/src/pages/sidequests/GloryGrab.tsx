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
  const [chaosLevel, setChaosLevel] = useState(1); // Increases with each replay
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
    ],
    chaos: [
      "MORE CHAOS! I LOVE IT!",
      "Yes! Let the mayhem multiply!",
      "The laboratory trembles with power!",
      "ASCENDING TO NEW LEVELS OF MADNESS!"
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
    
    // Show chaos escalation if replaying
    if (chaosLevel > 1) {
      showHeinousReaction('chaos');
    } else {
      showHeinousReaction('start');
    }
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

  // Spawn vials randomly during gameplay with chaos escalation
  useEffect(() => {
    if (gamePhase === 'playing') {
      // Chaos level affects max vials and spawn rate
      const maxVials = Math.min(8 + (chaosLevel - 1) * 3, 20); // Cap at 20 vials
      const baseSpawnRate = 1000;
      const chaosSpeedMultiplier = Math.max(0.3, 1 - (chaosLevel - 1) * 0.15); // Faster spawning
      const spawnRate = baseSpawnRate * chaosSpeedMultiplier;
      
      const spawnInterval = setInterval(() => {
        if (vials.length < maxVials) {
          // Spawn multiple vials at higher chaos levels
          const vialsToSpawn = chaosLevel >= 3 ? Math.min(2, maxVials - vials.length) : 1;
          for (let i = 0; i < vialsToSpawn; i++) {
            setTimeout(() => createVial(), i * 100); // Stagger spawns slightly
          }
        }
      }, spawnRate + Math.random() * (spawnRate * 0.5));
      
      return () => clearInterval(spawnInterval);
    }
  }, [gamePhase, vials.length, createVial, chaosLevel]);

  return (
    <div 
      
      style={{
        backgroundImage: 'url(/sidequests/glory-grab/glory-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div  />
      
      {showHeinous && (
        <div  style={{ top: 'calc(50% - 2rem)' }}>
          <div >
            {showHeinousMessage && (
              <div >
                <div  >
                  {heinousMessage}
                </div>
                <div >
                  <div ></div>
                  <div ></div>
                </div>
              </div>
            )}
            
            <img
              src={heinousSprites.scheming}
              alt="Dr. Heinous"
              
              style={{ marginTop: '2rem' }}
            />
          </div>
        </div>
      )}

      <div >
        
        {gamePhase === 'title' && (
          <div 
            
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
            
          >
            <div >
              <div >
                <div >
                  <div >SCORE</div>
                  <div >{score}</div>
                </div>
                <div >
                  <div >TIME</div>
                  <div >{timeLeft}s</div>
                </div>
                {chaosLevel > 1 && (
                  <div >
                    <div >CHAOS</div>
                    <div className={`text-xl font-bold ${
                      chaosLevel <= 3 ? 'text-yellow-400' :
                      chaosLevel <= 6 ? 'text-orange-400' : 'text-red-400'
                    } animate-pulse`}>
                      {chaosLevel}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {vials.filter(v => v.isExploding).length >= 2 && (
              <div >
                <div >
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
                  
                  style={{
                    filter: vial.isExploding ? 'brightness(3) saturate(3) hue-rotate(0deg)' : 'none'
                  }}
                />
                
                <div >
                  <div 
                    
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
          <div  >
            <div >
              <h1 >
                EXPERIMENT COMPLETE!
              </h1>
              <div  >
                Final Score: {score}
              </div>
              <div >
                {score >= 100 ? "Magnificent! You saved the lab!" :
                 score >= 50 ? "Not bad, but my vials are still smoking..." :
                 "Pathetic! My laboratory is in ruins!"}
              </div>
              
              {chaosLevel > 1 && (
                <div   >
                  <div className={`text-lg font-bold ${
                    chaosLevel <= 3 ? 'text-yellow-400' :
                    chaosLevel <= 6 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    Chaos Level {chaosLevel} Complete!
                  </div>
                  <div >
                    {chaosLevel <= 2 ? "The laboratory grows unstable..." :
                     chaosLevel <= 4 ? "Vials spawn faster and multiply!" :
                     chaosLevel <= 6 ? "MAXIMUM MAYHEM APPROACHING!" :
                     "REALITY BENDS TO YOUR CHAOS!"}
                  </div>
                </div>
              )}
              
              <div >
                <Button
                  onClick={() => {
                    setChaosLevel(prev => prev + 1);
                    startGame();
                  }}
                  
                >
                  {chaosLevel === 1 ? 'Play Again' : `CHAOS LEVEL ${chaosLevel + 1}!`}
                </Button>
                
                <Button
                  onClick={handleReturnToGame}
                  variant="ghost"
                  
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