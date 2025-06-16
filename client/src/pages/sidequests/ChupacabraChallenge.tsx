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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-red-400 mb-4 tracking-wider">
            CHUPACABRA CHALLENGE
          </h1>
          <p className="text-lg text-gray-300">
            Survive 30 seconds without being detected by the prowling beast
          </p>
        </div>

        {/* Game Area */}
        <div className="relative">
          
          {gamePhase === "intro" && (
            <div className="text-center bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-red-500/30">
              <div className="mb-6">
                <img 
                  src="/chupacabra/sprite-chupacabra.png"
                  alt="Chupacabra"
                  className="w-32 h-32 mx-auto mb-4"
                />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">The Hunt Begins</h2>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                The legendary Chupacabra stalks these cursed grounds. Choose your hiding spot wisely - 
                some locations offer better concealment than others. Can you remain hidden for 30 seconds?
              </p>
              <Button 
                onClick={startGame}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              >
                Begin the Challenge
              </Button>
            </div>
          )}

          {gamePhase === "hiding" && (
            <div className="text-center">
              <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-red-500/30 mb-6">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Choose Your Hiding Spot</h2>
                <p className="text-gray-300 mb-4">
                  Click on a location to hide. Each spot has different safety ratings...
                </p>
              </div>
              
              {/* Cemetery Map */}
              <div className="relative bg-gray-800 rounded-lg h-96 overflow-hidden border-2 border-gray-600">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)' }}
                />
                
                {spots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => selectHidingSpot(spot)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-green-600/70 hover:bg-green-500 border-2 border-green-400 rounded-lg p-2 text-xs font-bold transition-all hover:scale-110"
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`
                    }}
                    title={`${spot.name} (Safety: ${spot.safetyRating}/5)`}
                  >
                    <span className="block text-center">
                      {spot.name}
                    </span>
                    <div className="flex justify-center mt-1">
                      {Array.from({ length: spot.safetyRating }, (_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(gamePhase === "hunting") && (
            <div className={`text-center ${heartbeat ? 'animate-pulse' : ''}`}>
              <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-red-500/30 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left">
                    <div className="text-lg font-bold text-green-400">
                      Hidden: {currentHidingSpot?.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      Safety Rating: {Array.from({ length: currentHidingSpot?.safetyRating || 0 }, (_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">
                      {timeRemaining}s
                    </div>
                    <div className="text-sm text-gray-400">remaining</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Detection Risk</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        detectionRisk > 70 ? 'bg-red-500' : detectionRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${detectionRisk}%` }}
                    />
                  </div>
                </div>
                
                <p className={`text-center ${detectionRisk > 70 ? 'text-red-400' : 'text-gray-300'}`}>
                  {getChupacabraReaction()}
                </p>
              </div>
              
              {/* Game Area with Chupacabra */}
              <div className="relative bg-gray-800 rounded-lg h-96 overflow-hidden border-2 border-gray-600">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{ backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)' }}
                />
                
                {/* Player's hiding spot */}
                {currentHidingSpot && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-green-600/50 border-2 border-green-400 rounded-lg"
                    style={{
                      left: `${currentHidingSpot.x}%`,
                      top: `${currentHidingSpot.y}%`,
                      width: `${currentHidingSpot.width}%`,
                      height: `${currentHidingSpot.height}%`
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs font-bold">YOU</span>
                    </div>
                  </div>
                )}
                
                {/* Chupacabra */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{
                    left: `${chupacabraPosition.x}%`,
                    top: `${chupacabraPosition.y}%`
                  }}
                >
                  <img 
                    src="/chupacabra/sprite-chupacabra.png"
                    alt="Chupacabra"
                    className="w-16 h-16"
                  />
                </div>
              </div>
            </div>
          )}

          {(gamePhase === "caught" || gamePhase === "survived") && (
            <div className="text-center">
              <div className={`bg-black/50 backdrop-blur-sm p-8 rounded-lg border mb-6 ${
                gamePhase === "caught" ? 'border-red-500/50 bg-red-900/20' : 'border-green-500/50 bg-green-900/20'
              }`}>
                <div className="mb-6">
                  <img 
                    src="/chupacabra/sprite-chupacabra.png"
                    alt="Chupacabra"
                    className={`w-32 h-32 mx-auto mb-4 ${gamePhase === "caught" ? 'animate-bounce' : 'opacity-50'}`}
                  />
                </div>
                
                <h2 className={`text-3xl font-bold mb-4 ${
                  gamePhase === "caught" ? 'text-red-400' : 'text-green-400'
                }`}>
                  {getResultMessage().title}
                </h2>
                
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  {getResultMessage().message}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={startGame}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                  >
                    Hunt Again
                  </Button>
                  <Link href="/game/headquarters" className="no-underline">
                    <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 w-full">
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