import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HidingSpot {
  id: number;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number;
  height: number;
  safetyRating: number; // 1-5, higher is safer
  discovered: boolean;
}

const hidingSpots: HidingSpot[] = [
  { id: 1, name: "Behind the Tombstone", x: 15, y: 60, width: 12, height: 15, safetyRating: 4, discovered: false },
  { id: 2, name: "Under the Gnarled Tree", x: 45, y: 25, width: 15, height: 20, safetyRating: 3, discovered: false },
  { id: 3, name: "In the Fog Bank", x: 70, y: 45, width: 20, height: 25, safetyRating: 5, discovered: false },
  { id: 4, name: "Behind the Crypt", x: 25, y: 20, width: 18, height: 25, safetyRating: 4, discovered: false },
  { id: 5, name: "Among the Weeds", x: 60, y: 75, width: 25, height: 15, safetyRating: 2, discovered: false },
  { id: 6, name: "Near the Gate", x: 5, y: 35, width: 15, height: 20, safetyRating: 1, discovered: false },
];

type GamePhase = "intro" | "hiding" | "hunting" | "caught" | "survived" | "result";

export function ChupacabraChallenge() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [currentHidingSpot, setCurrentHidingSpot] = useState<HidingSpot | null>(null);
  const [chupacabraPosition, setChupacabraPosition] = useState({ x: 0, y: 50 });
  const [huntingProgress, setHuntingProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [spots, setSpots] = useState(hidingSpots);
  const [detectionRisk, setDetectionRisk] = useState(0);
  const [heartbeat, setHeartbeat] = useState(false);
  const huntingTimer = useRef<NodeJS.Timeout>();
  const gameTimer = useRef<NodeJS.Timeout>();

  const startGame = () => {
    setGamePhase("hiding");
    setSpots(hidingSpots.map(spot => ({ ...spot, discovered: false })));
    setTimeRemaining(30);
    setHuntingProgress(0);
    setDetectionRisk(0);
  };

  const selectHidingSpot = (spot: HidingSpot) => {
    if (gamePhase !== "hiding") return;
    
    setCurrentHidingSpot(spot);
    setGamePhase("hunting");
    startHunting();
  };

  const startHunting = () => {
    // Start game timer
    gameTimer.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGamePhase("survived");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start hunting simulation
    huntingTimer.current = setInterval(() => {
      setHuntingProgress(prev => {
        const newProgress = prev + 1;
        
        // Move Chupacabra around the area
        setChupacabraPosition({
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        });

        // Calculate detection risk based on hiding spot and Chupacabra proximity
        if (currentHidingSpot) {
          const distance = Math.sqrt(
            Math.pow(chupacabraPosition.x - currentHidingSpot.x, 2) + 
            Math.pow(chupacabraPosition.y - currentHidingSpot.y, 2)
          );
          
          const proximityRisk = Math.max(0, (30 - distance) / 30);
          const spotRisk = (6 - currentHidingSpot.safetyRating) * 0.2;
          const totalRisk = (proximityRisk + spotRisk) * 100;
          
          setDetectionRisk(Math.min(100, totalRisk));
          
          // Trigger heartbeat effect when risk is high
          setHeartbeat(totalRisk > 60);
          
          // Check for discovery
          if (totalRisk > 85 && Math.random() < 0.3) {
            setGamePhase("caught");
            clearTimers();
            return newProgress;
          }
        }
        
        return newProgress;
      });
    }, 500);
  };

  const clearTimers = () => {
    if (huntingTimer.current) clearInterval(huntingTimer.current);
    if (gameTimer.current) clearInterval(gameTimer.current);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const getChupacabraReaction = () => {
    if (gamePhase === "caught") {
      return "¡ENCONTRADO! The Chupacabra's eyes gleam with satisfaction!";
    } else if (gamePhase === "survived") {
      return "The Chupacabra retreats, frustrated by your cunning...";
    } else if (detectionRisk > 70) {
      return "The Chupacabra sniffs the air... it senses something nearby...";
    } else if (detectionRisk > 40) {
      return "Prowling closer... stay perfectly still...";
    } else {
      return "The Chupacabra searches in the distance...";
    }
  };

  const getResultMessage = () => {
    if (gamePhase === "caught") {
      return {
        title: "DISCOVERED!",
        message: "The Chupacabra's supernatural senses detected your presence. Sometimes the hunter becomes the hunted...",
        effect: "caught-effect"
      };
    } else {
      return {
        title: "SURVIVAL SUCCESS!",
        message: `You evaded the Chupacabra for the full 30 seconds! Your hiding spot ${currentHidingSpot?.name} proved to be the perfect refuge.`,
        effect: "survived-effect"
      };
    }
  };

  return (
    <div >
      <div >
        
        {/* Header */}
        <div  style={{textAlign: "center"}}>
          <h1 >
            CHUPACABRA CHALLENGE
          </h1>
          <p >
            Survive 30 seconds without being detected by the prowling beast
          </p>
        </div>

        {/* Game Area */}
        <div >
          
          {gamePhase === "intro" && (
            <div  style={{textAlign: "center"}}>
              <div >
                <img 
                  src="/chupacabra/sprite-chupacabra.png"
                  alt="Chupacabra"
                  
                />
              </div>
              <h2 >The Hunt Begins</h2>
              <p  >
                The legendary Chupacabra stalks these cursed grounds. Choose your hiding spot wisely - 
                some locations offer better concealment than others. Can you remain hidden for 30 seconds?
              </p>
              <Button 
                onClick={startGame}
                
              >
                Begin the Challenge
              </Button>
            </div>
          )}

          {gamePhase === "hiding" && (
            <div style={{textAlign: "center"}}>
              <div  >
                <h2 >Choose Your Hiding Spot</h2>
                <p >
                  Click on a location to hide. Each spot has different safety ratings...
                </p>
              </div>
              
              {/* Cemetery Map */}
              <div >
                <div 
                  
                  style={{ backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)' }}
                />
                
                {spots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => selectHidingSpot(spot)}
                    
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`
                    }}
                    title={`${spot.name} (Safety: ${spot.safetyRating}/5)`}
                  >
                    <span  style={{textAlign: "center"}}>
                      {spot.name}
                    </span>
                    <div >
                      {Array.from({ length: spot.safetyRating }, (_, i) => (
                        <span key={i} >★</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(gamePhase === "hunting") && (
            <div style={{ padding: '2rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', margin: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Hidden: {currentHidingSpot?.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Safety Rating: {Array.from({ length: currentHidingSpot?.safetyRating || 0 }, (_, i) => (
                        <span key={i} style={{ color: '#fbbf24' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {timeRemaining}s
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>remaining</div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Detection Risk</div>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '9999px', height: '0.75rem' }}>
                    <div 
                      style={{
                        height: '0.75rem',
                        borderRadius: '9999px',
                        transition: 'all 0.5s ease',
                        backgroundColor: detectionRisk > 70 ? '#ef4444' : detectionRisk > 40 ? '#eab308' : '#22c55e',
                        width: `${detectionRisk}%`
                      }}
                    />
                  </div>
                </div>
                
                <p style={{ textAlign: 'center', fontSize: '0.875rem', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {getChupacabraReaction()}
                </p>
              </div>
              
              {/* Game Area with Chupacabra */}
              <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)',
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* Player's hiding spot */}
                {currentHidingSpot && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${currentHidingSpot.x}%`,
                      top: `${currentHidingSpot.y}%`,
                      width: `${currentHidingSpot.width}%`,
                      height: `${currentHidingSpot.height}%`
                    }}
                  >
                    <div style={{ backgroundColor: 'rgba(0, 255, 0, 0.7)', padding: '0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
                      <span style={{ color: 'black' }}>YOU</span>
                    </div>
                  </div>
                )}
                
                {/* Chupacabra */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${chupacabraPosition.x}%`,
                    top: `${chupacabraPosition.y}%`,
                    transition: 'all 1s ease'
                  }}
                >
                  <img 
                    src="/chupacabra/sprite-chupacabra.png"
                    alt="Chupacabra"
                    style={{ width: '50px', height: '50px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {(gamePhase === "caught" || gamePhase === "survived") && (
            <div style={{textAlign: "center"}}>
              <div style={{
                padding: '2rem',
                borderRadius: '0.5rem',
                border: gamePhase === "caught" ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                backgroundColor: gamePhase === "caught" ? 'rgba(127, 29, 29, 0.2)' : 'rgba(20, 83, 45, 0.2)'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src="/chupacabra/sprite-chupacabra.png"
                    alt="Chupacabra"
                    style={{ width: '100px', height: '100px', margin: '0 auto' }}
                  />
                </div>
                
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: gamePhase === "caught" ? '#f87171' : '#4ade80'
                }}>
                  {getResultMessage().title}
                </h2>
                
                <p style={{ marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {getResultMessage().message}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Button 
                    onClick={startGame}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Hunt Again
                  </Button>
                  <Link href="/game/headquarters" >
                    <Button >
                      Return to Main Game
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
        
      </div>
    </div>
  );
}