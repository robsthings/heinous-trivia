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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4 bg-gradient-to-b from-purple-900 via-indigo-900 to-black">
      {/* Wailing effect overlay */}
      {gamePhase === "playing" && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(139, 69, 19, ${wailIntensity * 0.1}) 0%, transparent 70%)`,
            animation: `pulse ${2 / wailIntensity}s ease-in-out infinite`
          }}
        />
      )}

      <div className="relative z-10 w-full max-w-4xl">
        {/* Title */}
        <div className=" mb-8" className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-300 mb-4 drop-shadow-lg">
            BANSHEE'S WAIL
          </h1>
          <p className="text-lg md:text-xl text-purple-200 drop-shadow-md">
            Hit the beats to silence the banshee's cry!
          </p>
        </div>

        {gamePhase === "intro" && (
          <div className=" mb-8" className="text-center">
            <div className="bg-black/80 border border-purple-500 rounded-lg p-6 md:p-8 max-w-md mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4">
                Ready to Face the Banshee?
              </h2>
              <p className="text-base md:text-lg text-purple-200 mb-4">
                Time the beats perfectly to silence her wail. Miss too many and face her fury!
              </p>
              <div className="text-sm md:text-base text-purple-300  space-y-2" className="mb-6">
                <p>• Hit SPACEBAR or tap when beats reach the purple zone</p>
                <p>• Build combos for higher scores</p>
                <p>• You have 3 lives - don't miss!</p>
                <p>• Survive 60 seconds to win</p>
              </div>
              
              <Button
                onClick={initializeGame}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Begin the Ritual
              </Button>
            </div>
          </div>
        )}

        {gamePhase === "playing" && (
          <>
            {/* Game Stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8  " className="mb-6" className="text-center">
              <div className="text-purple-200">
                <span className="text-lg md:text-xl font-bold">Score: {score}</span>
              </div>
              <div className="text-purple-200">
                <span className="text-lg md:text-xl font-bold">Combo: {combo}</span>
              </div>
              <div className="text-purple-200">
                <span className="text-lg md:text-xl font-bold">Lives: {lives}</span>
              </div>
              <div className="text-purple-200">
                <span className="text-lg md:text-xl font-bold">Time: {timeLeft}s</span>
              </div>
            </div>

            {/* Wail Intensity Indicator */}
            <div  className="mb-6" className="text-center">
              <p className="text-base md:text-lg text-purple-300 animate-pulse">
                {getWailMessage()}
              </p>
            </div>

            {/* Beat Track */}
            <div className="relative w-full h-20 md:h-24 bg-black/50 border-2 border-purple-500 rounded-lg  overflow-hidden" className="mb-6">
              {/* Hit Zone */}
              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-purple-500/30 border-l-2 border-purple-400 flex items-center justify-center">
                <span className="text-purple-300 font-bold text-sm md:text-base">HIT</span>
              </div>

              {/* Beats */}
              {beats.map(beat => (
                <div
                  key={beat.id}
                  className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-100 ${
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
            <div className="text-center">
              <Button
                onClick={hitBeat}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 md:py-6 md:px-12 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg md:text-xl"
              >
                HIT BEAT (SPACE)
              </Button>
            </div>
          </>
        )}

        {gamePhase === "victory" && (
          <div className=" mb-8" className="text-center">
            <div className="bg-black/80 border border-green-500 rounded-lg p-6 md:p-8 max-w-md mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
                The Banshee is Silenced!
              </h2>
              <p className="text-lg md:text-xl text-green-200 mb-4">
                You survived the wailing with perfect timing!
              </p>
              <div className="text-base md:text-lg text-green-300  space-y-2" className="mb-6">
                <p>Final Score: {score}</p>
                <p>Max Combo: {maxCombo}</p>
                <p>Performance: {getPerformanceRating()}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={initializeGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Face Another Banshee
                </Button>
                <Link href="/game/headquarters">
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Return to Main Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {gamePhase === "defeat" && (
          <div className=" mb-8" className="text-center">
            <div className="bg-black/80 border border-red-500 rounded-lg p-6 md:p-8 max-w-md mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-4">
                The Banshee's Wail Consumes You!
              </h2>
              <p className="text-lg md:text-xl text-red-200 mb-4">
                Your timing faltered and the banshee's cry overwhelmed you.
              </p>
              <div className="text-base md:text-lg text-red-300  space-y-2" className="mb-6">
                <p>Final Score: {score}</p>
                <p>Max Combo: {maxCombo}</p>
                <p>Performance: {getPerformanceRating()}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={initializeGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Try Again
                </Button>
                <Link href="/game/headquarters">
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
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