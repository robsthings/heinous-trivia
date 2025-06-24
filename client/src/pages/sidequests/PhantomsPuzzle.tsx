import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PuzzlePattern {
  id: number;
  sequence: string[];
  userInput: string[];
  isComplete: boolean;
  difficulty: number;
}

const phantomSymbols = ["👻", "🌙", "⭐", "🔮", "💀", "🕯️"];

type GamePhase = "intro" | "studying" | "inputting" | "victory" | "defeat";

export function PhantomsPuzzle() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [currentPattern, setCurrentPattern] = useState<PuzzlePattern | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [studyTimeLeft, setStudyTimeLeft] = useState(0);
  const [inputTimeLeft, setInputTimeLeft] = useState(0);
  const [phantomMessage, setPhantomMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const studyTimer = useRef<NodeJS.Timeout>();
  const inputTimer = useRef<NodeJS.Timeout>();

  const generatePattern = (difficulty: number): string[] => {
    const length = Math.min(3 + difficulty, 8); // Start with 4 symbols, max 8
    const pattern: string[] = [];
    
    for (let i = 0; i < length; i++) {
      const randomSymbol = phantomSymbols[Math.floor(Math.random() * phantomSymbols.length)];
      pattern.push(randomSymbol);
    }
    
    return pattern;
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setMistakes(0);
    startLevel(1);
  };

  const startLevel = (levelNum: number) => {
    const pattern = generatePattern(levelNum);
    const newPattern: PuzzlePattern = {
      id: Date.now(),
      sequence: pattern,
      userInput: [],
      isComplete: false,
      difficulty: levelNum
    };
    
    setCurrentPattern(newPattern);
    setLevel(levelNum);
    setGamePhase("studying");
    
    // Study time decreases as difficulty increases
    const studyTime = Math.max(8 - levelNum, 4);
    setStudyTimeLeft(studyTime);
    setPhantomMessage(`Study the phantom's pattern... Level ${levelNum}`);
    
    startStudyTimer(studyTime);
  };

  const startStudyTimer = (duration: number) => {
    studyTimer.current = setInterval(() => {
      setStudyTimeLeft(prev => {
        if (prev <= 1) {
          setGamePhase("inputting");
          startInputPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startInputPhase = () => {
    if (studyTimer.current) clearInterval(studyTimer.current);
    
    // Input time also decreases with difficulty
    const inputTime = Math.max(12 - level, 6);
    setInputTimeLeft(inputTime);
    setPhantomMessage("Now recreate the pattern from memory!");
    
    inputTimer.current = setInterval(() => {
      setInputTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - check current progress
          checkPattern(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const addSymbolToInput = (symbol: string) => {
    if (gamePhase !== "inputting" || !currentPattern) return;
    
    const newInput = [...currentPattern.userInput, symbol];
    const updatedPattern = { ...currentPattern, userInput: newInput };
    setCurrentPattern(updatedPattern);
    
    // Check if pattern is complete
    if (newInput.length === currentPattern.sequence.length) {
      checkPattern(false);
    }
  };

  const checkPattern = (timeUp: boolean) => {
    if (!currentPattern) return;
    
    clearTimers();
    
    const isCorrect = currentPattern.sequence.every((symbol, index) => 
      symbol === currentPattern.userInput[index]
    );
    
    const isComplete = currentPattern.userInput.length === currentPattern.sequence.length;
    
    if (isCorrect && isComplete) {
      // Perfect match
      const bonusPoints = Math.max(5 - mistakes, 1) * level;
      setScore(prev => prev + bonusPoints);
      setPhantomMessage(`Excellent! +${bonusPoints} points`);
      
      setTimeout(() => {
        if (level >= 7) {
          setGamePhase("victory");
        } else {
          startLevel(level + 1);
        }
      }, 2000);
    } else if (timeUp) {
      // Time ran out
      setMistakes(prev => prev + 1);
      setPhantomMessage("Time's up! The phantom grows impatient...");
      
      setTimeout(() => {
        if (mistakes >= 2) {
          setGamePhase("defeat");
        } else {
          // Retry same level with penalty
          startLevel(level);
        }
      }, 2000);
    } else {
      // Incorrect input
      setMistakes(prev => prev + 1);
      setPhantomMessage("Incorrect pattern! The phantom's power weakens you...");
      
      setTimeout(() => {
        if (mistakes >= 2) {
          setGamePhase("defeat");
        } else {
          // Retry same level
          startLevel(level);
        }
      }, 2000);
    }
  };

  const clearTimers = () => {
    if (studyTimer.current) clearInterval(studyTimer.current);
    if (inputTimer.current) clearInterval(inputTimer.current);
  };

  const resetInput = () => {
    if (!currentPattern || gamePhase !== "inputting") return;
    setCurrentPattern(prev => prev ? { ...prev, userInput: [] } : null);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const getPhantomReaction = () => {
    if (phantomMessage) return phantomMessage;
    
    if (mistakes >= 2) {
      return "Your mind fails you... the phantom claims victory!";
    } else if (level >= 5) {
      return "Impressive mortal... but can you handle more complexity?";
    } else if (mistakes >= 1) {
      return "Focus! The phantom tests your mental fortitude...";
    } else {
      return "The phantom weaves its ethereal patterns...";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className=" " style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}}>
          <h1 className="text-4xl lg:text-6xl font-bold text-blue-400 mb-4 tracking-wider">
            PHANTOM'S PUZZLE
          </h1>
          <p className="text-lg text-gray-300">
            Memorize and recreate the phantom's ethereal patterns
          </p>
        </div>

        {gamePhase === "intro" && (
          <div className=" bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-blue-500/30" style={{textAlign: "center"}}>
            <div style={{marginBottom: "1.5rem"}}>
              <span className="text-8xl">👻</span>
            </div>
            <h2 className="text-2xl font-bold text-blue-400 mb-4">The Phantom's Challenge</h2>
            <p className="text-gray-300  max-w-md mx-auto" style={{marginBottom: "1.5rem"}}>
              The ethereal phantom will show you mystical patterns that grow increasingly complex. 
              Study each sequence carefully, then recreate it from memory. 
              Three mistakes and your mind belongs to the phantom!
            </p>
            <Button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Accept the Challenge
            </Button>
          </div>
        )}

        {(gamePhase === "studying" || gamePhase === "inputting") && (
          <div>
            {/* Game Stats */}
            <div className="flex justify-between items-center  bg-black/30 rounded-lg p-4" style={{marginBottom: "1.5rem"}}>
              <div style={{textAlign: "center"}}>
                <div className="text-2xl font-bold text-blue-400">{level}</div>
                <div className="text-sm text-gray-400">Level</div>
              </div>
              <div style={{textAlign: "center"}}>
                <div className="text-xl text-purple-400">{score}</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
              <div style={{textAlign: "center"}}>
                <div className={`text-2xl font-bold ${mistakes >= 2 ? 'text-red-400' : mistakes >= 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {3 - mistakes}
                </div>
                <div className="text-sm text-gray-400">Lives Left</div>
              </div>
            </div>

            {/* Timer */}
            <div className=" " style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}}>
              <div className={`text-4xl font-bold ${
                (gamePhase === "studying" ? studyTimeLeft : inputTimeLeft) <= 3 ? 'text-red-400 animate-pulse' : 'text-blue-400'
              }`}>
                {gamePhase === "studying" ? studyTimeLeft : inputTimeLeft}s
              </div>
              <div className="text-sm text-gray-400">
                {gamePhase === "studying" ? "Study Time" : "Input Time"}
              </div>
            </div>

            {/* Phantom Message */}
            <div className="  bg-blue-900/20 rounded-lg p-4 border border-blue-500/30" style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}}>
              <p className="text-blue-300 italic">"{getPhantomReaction()}"</p>
            </div>

            {/* Pattern Display */}
            {gamePhase === "studying" && currentPattern && (
              <div style={{marginBottom: "1.5rem"}}>
                <h3 className="text-xl font-bold  mb-4 text-blue-400" style={{textAlign: "center"}}>Study This Pattern</h3>
                <div className="flex justify-center gap-3 flex-wrap bg-gray-800/50 rounded-lg p-6 border border-gray-600">
                  {currentPattern.sequence.map((symbol, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-blue-600/30 rounded-lg flex items-center justify-center text-3xl border border-blue-400/50"
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Phase */}
            {gamePhase === "inputting" && currentPattern && (
              <div>
                <h3 className="text-xl font-bold  mb-4 text-blue-400" style={{textAlign: "center"}}>Recreate the Pattern</h3>
                
                {/* User Input Display */}
                <div className=" flex justify-center gap-3 flex-wrap bg-gray-800/50 rounded-lg p-6 border border-gray-600 min-h-[100px]" style={{marginBottom: "1.5rem"}}>
                  {currentPattern.sequence.map((_, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl border-2 ${
                        index < currentPattern.userInput.length
                          ? 'bg-green-600/30 border-green-400 text-white'
                          : 'bg-gray-700/30 border-gray-500 border-dashed'
                      }`}
                    >
                      {index < currentPattern.userInput.length ? currentPattern.userInput[index] : "?"}
                    </div>
                  ))}
                </div>

                {/* Symbol Selection */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-4">
                  {phantomSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => addSymbolToInput(symbol)}
                      className="w-16 h-16 bg-blue-600/30 hover:bg-blue-500/50 rounded-lg flex items-center justify-center text-3xl border border-blue-400/50 transition-all hover:scale-110"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>

                {/* Reset Button */}
                <div style={{textAlign: "center"}}>
                  <Button
                    onClick={resetInput}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                  >
                    Clear Input
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {(gamePhase === "victory" || gamePhase === "defeat") && (
          <div style={{textAlign: "center"}}>
            <div className={`bg-black/50 backdrop-blur-sm p-8 rounded-lg border mb-6 ${
              gamePhase === "victory" ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'
            }`}>
              <div style={{marginBottom: "1.5rem"}}>
                <span className="text-8xl">
                  {gamePhase === "victory" ? "🧠" : "👻"}
                </span>
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                gamePhase === "victory" ? 'text-green-400' : 'text-red-400'
              }`}>
                {gamePhase === "victory" ? "MENTAL MASTERY!" : "PHANTOM VICTORY!"}
              </h2>
              
              <p className="text-gray-300 mb-4">
                {gamePhase === "victory" 
                  ? "Your mind has proven superior to the phantom's ethereal puzzles!" 
                  : "The phantom has overwhelmed your mental defenses..."}
              </p>
              
              <div className="  bg-gray-800/50 rounded-lg p-4" style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}}>
                <div className="text-lg font-bold text-blue-400 mb-2">Final Results</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{score}</div>
                    <div className="text-sm text-gray-400">Total Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{level}</div>
                    <div className="text-sm text-gray-400">Levels Completed</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  Challenge Again
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
  );
}