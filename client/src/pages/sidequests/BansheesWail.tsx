import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Beat {
  id: number;
  position: number; // 0-100% from left to right
  hit: boolean;
  missed: boolean;
}

type GamePhase = "intro" | "playing" | "victory" | "defeat";

export function BansheesWail() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wailIntensity, setWailIntensity] = useState(1);
  const gameTimer = useRef<NodeJS.Timeout>();
  const beatSpawner = useRef<NodeJS.Timeout>();
  const beatMover = useRef<NodeJS.Timeout>();
  const nextBeatId = useRef(1);

  const initializeGame = () => {
    setGamePhase("playing");
    setBeats([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setTimeLeft(60);
    setWailIntensity(1);
    nextBeatId.current = 1;
    
    // Start game timer
    gameTimer.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame("victory");
          return 0;
        }
        
        // Increase difficulty every 15 seconds
        if (prev % 15 === 0) {
          setWailIntensity(prev => Math.min(prev + 0.5, 3));
        }
        
        return prev - 1;
      });
    }, 1000);

    // Start beat spawning
    spawnBeats();
    moveBeats();
  };

  const spawnBeats = () => {
    const spawnInterval = Math.max(800 - (wailIntensity * 200), 400); // Faster spawning as intensity increases
    
    beatSpawner.current = setTimeout(() => {
      if (gamePhase === "playing") {
        setBeats(prev => [...prev, {
          id: nextBeatId.current++,
          position: 0,
          hit: false,
          missed: false
        }]);
        spawnBeats();
      }
    }, spawnInterval + Math.random() * 400); // Add some randomness
  };

  const moveBeats = () => {
    beatMover.current = setInterval(() => {
      setBeats(prev => prev.map(beat => {
        if (beat.hit || beat.missed) return beat;
        
        const newPosition = beat.position + (2 + wailIntensity * 0.5); // Speed increases with intensity
        
        if (newPosition >= 100 && !beat.missed) {
          // Beat reached the end without being hit
          setLives(current => {
            const newLives = current - 1;
            if (newLives <= 0) {
              endGame("defeat");
            }
            return newLives;
          });
          setCombo(0);
          return { ...beat, missed: true };
        }
        
        return { ...beat, position: newPosition };
      }).filter(beat => beat.position < 110)); // Remove beats that are off-screen
    }, 50);
  };

  const hitBeat = () => {
    const hitZone = { start: 75, end: 90 }; // Hit zone near the right side
    
    setBeats(prev => {
      let beatHit = false;
      const updatedBeats = prev.map(beat => {
        if (!beat.hit && !beat.missed && beat.position >= hitZone.start && beat.position <= hitZone.end) {
          if (!beatHit) { // Only hit the first beat in range
            beatHit = true;
            return { ...beat, hit: true };
          }
        }
        return beat;
      });
      
      if (beatHit) {
        setScore(current => current + (10 + combo * 2)); // Score increases with combo
        setCombo(current => {
          const newCombo = current + 1;
          setMaxCombo(max => Math.max(max, newCombo));
          return newCombo;
        });
      } else {
        setCombo(0);
      }
      
      return updatedBeats;
    });
  };

  const endGame = (result: "victory" | "defeat") => {
    setGamePhase(result);
    clearTimeout(gameTimer.current);
    clearTimeout(beatSpawner.current);
    clearInterval(beatMover.current);
  };

  useEffect(() => {
    return () => {
      clearTimeout(gameTimer.current);
      clearTimeout(beatSpawner.current);
      clearInterval(beatMover.current);
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gamePhase === "playing" && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
        hitBeat();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gamePhase]);

  const getWailMessage = () => {
    if (wailIntensity <= 1.5) return "The banshee's wail echoes softly...";
    if (wailIntensity <= 2.5) return "The banshee's wail grows stronger!";
    return "THE BANSHEE'S WAIL IS DEAFENING!";
  };

  const getPerformanceRating = () => {
    const accuracy = score / Math.max(nextBeatId.current - 1, 1) * 10;
    if (accuracy >= 80) return "PERFECT SILENCE";
    if (accuracy >= 60) return "GOOD RHYTHM";
    if (accuracy >= 40) return "POOR TIMING";
    return "CACOPHONY";
  };

  return (
    <div >
      {/* Wailing effect overlay */}
      {gamePhase === "playing" && (
        <div 
          
          style={{
            background: `radial-gradient(circle, rgba(139, 69, 19, ${wailIntensity * 0.1}) 0%, transparent 70%)`,
            animation: `pulse ${2 / wailIntensity}s ease-in-out infinite`
          }}
        />
      )}

      <div >
        {/* Title */}
        <div  >
          <h1 >
            BANSHEE'S WAIL
          </h1>
          <p >
            Hit the beats to silence the banshee's cry!
          </p>
        </div>

        {gamePhase === "intro" && (
          <div  >
            <div >
              <h2 >
                Ready to Face the Banshee?
              </h2>
              <p >
                Time the beats perfectly to silence her wail. Miss too many and face her fury!
              </p>
              <div  >
                <p>• Hit SPACEBAR or tap when beats reach the purple zone</p>
                <p>• Build combos for higher scores</p>
                <p>• You have 3 lives - don't miss!</p>
                <p>• Survive 60 seconds to win</p>
              </div>
              
              <Button
                onClick={initializeGame}
                
              >
                Begin the Ritual
              </Button>
            </div>
          </div>
        )}

        {gamePhase === "playing" && (
          <>
            {/* Game Stats */}
            <div   >
              <div >
                <span >Score: {score}</span>
              </div>
              <div >
                <span >Combo: {combo}</span>
              </div>
              <div >
                <span >Lives: {lives}</span>
              </div>
              <div >
                <span >Time: {timeLeft}s</span>
              </div>
            </div>

            {/* Wail Intensity Indicator */}
            <div   >
              <p >
                {getWailMessage()}
              </p>
            </div>

            {/* Beat Track */}
            <div  >
              {/* Hit Zone */}
              <div >
                <span >HIT</span>
              </div>

              {/* Beats */}
              {beats.map(beat => (
                <div
                  key={beat.id}
                    beat.hit 
                      ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                      : beat.missed 
                        ? 'bg-red-400 opacity-50' 
                        : 'bg-purple-400 shadow-lg shadow-purple-400/50 animate-pulse'
                  }`}
                  style={{ left: `${beat.position}%` }}
                />
              ))}
            </div>

            {/* Hit Button */}
            <div >
              <Button
                onClick={hitBeat}
                
              >
                HIT BEAT (SPACE)
              </Button>
            </div>
          </>
        )}

        {gamePhase === "victory" && (
          <div  >
            <div >
              <h2 >
                The Banshee is Silenced!
              </h2>
              <p >
                You survived the wailing with perfect timing!
              </p>
              <div  >
                <p>Final Score: {score}</p>
                <p>Max Combo: {maxCombo}</p>
                <p>Performance: {getPerformanceRating()}</p>
              </div>
              
              <div >
                <Button
                  onClick={initializeGame}
                  
                >
                  Face Another Banshee
                </Button>
                <Link href="/game/headquarters">
                  <Button >
                    Return to Main Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {gamePhase === "defeat" && (
          <div  >
            <div >
              <h2 >
                The Banshee's Wail Consumes You!
              </h2>
              <p >
                Your timing faltered and the banshee's cry overwhelmed you.
              </p>
              <div  >
                <p>Final Score: {score}</p>
                <p>Max Combo: {maxCombo}</p>
                <p>Performance: {getPerformanceRating()}</p>
              </div>
              
              <div >
                <Button
                  onClick={initializeGame}
                  
                >
                  Try Again
                </Button>
                <Link href="/game/headquarters">
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
  );
}