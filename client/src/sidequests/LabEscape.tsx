import React, { useState, useEffect } from 'react';

interface Riddle {
  id: number;
  question: string;
  answer: string;
  hint: string;
}

interface GameState {
  currentRiddle: number;
  correctAnswers: number;
  attempts: number;
  maxAttempts: number;
  gamePhase: 'intro' | 'riddle' | 'victory' | 'failure';
  showHint: boolean;
  currentGuess: string;
  message: string;
}

const RIDDLES: Riddle[] = [
  {
    id: 1,
    question: "I have no body, yet I scream. I have no lungs, yet I breathe. What am I?",
    answer: "wind",
    hint: "Listen to the air..."
  },
  {
    id: 2,
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    hint: "Every step creates evidence..."
  },
  {
    id: 3,
    question: "I consume all things, great and small. Given time, I'll take them all. What am I?",
    answer: "time",
    hint: "The eternal destroyer..."
  },
  {
    id: 4,
    question: "Born in darkness, I feed on light. The brighter the day, the shorter my life. What am I?",
    answer: "shadow",
    hint: "Companion of all things..."
  },
  {
    id: 5,
    question: "I have a face but no eyes, hands but no arms. I move but have no legs. What am I?",
    answer: "clock",
    hint: "Time's faithful servant..."
  },
  {
    id: 6,
    question: "The more holes you make in me, the stronger I become. What am I?",
    answer: "net",
    hint: "Fishermen know my purpose..."
  },
  {
    id: 7,
    question: "I am not alive, yet I grow. I have no lungs, yet I need air. What am I?",
    answer: "fire",
    hint: "The hungry destroyer..."
  },
  {
    id: 8,
    question: "I can be cracked, I can be made. I can be told, I can be played. What am I?",
    answer: "joke",
    hint: "Laughter's companion..."
  }
];

const CHUPACABRA_TAUNTS = [
  "Wrong again, human fool!",
  "Your mind grows weaker!",
  "The laboratory claims another victim!",
  "Failure feeds my power!",
  "Think harder, if you can!",
  "Your escape grows more distant!",
  "Another wrong turn in the darkness!",
  "The riddles mock your intelligence!"
];

const VICTORY_MESSAGES = [
  "Impossible! You've escaped my trap!",
  "The laboratory doors swing open...",
  "Your wit has bested the darkness!",
  "Freedom tastes sweet, doesn't it?"
];

export function LabEscape() {
  const [gameState, setGameState] = useState<GameState>({
    currentRiddle: 0,
    correctAnswers: 0,
    attempts: 0,
    maxAttempts: 5,
    gamePhase: 'intro',
    showHint: false,
    currentGuess: '',
    message: ''
  });

  const [doorGlow, setDoorGlow] = useState<number[]>([]);

  // Animate door glows
  useEffect(() => {
    if (gameState.gamePhase === 'riddle') {
      const interval = setInterval(() => {
        setDoorGlow(prev => {
          const newGlow = [...prev];
          const randomDoor = Math.floor(Math.random() * 3);
          newGlow[randomDoor] = Date.now();
          return newGlow;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [gameState.gamePhase]);

  const startGame = () => {
    setGameState({
      currentRiddle: 0,
      correctAnswers: 0,
      attempts: 0,
      maxAttempts: 5,
      gamePhase: 'riddle',
      showHint: false,
      currentGuess: '',
      message: 'Choose a door to face your first riddle...'
    });
    setDoorGlow([]);
  };

  const selectDoor = (doorIndex: number) => {
    if (gameState.gamePhase !== 'riddle') return;
    
    setGameState(prev => ({
      ...prev,
      message: `Door ${doorIndex + 1} creaks open, revealing a riddle...`
    }));
  };

  const submitAnswer = () => {
    const currentRiddle = RIDDLES[gameState.currentRiddle];
    const userAnswer = gameState.currentGuess.toLowerCase().trim();
    const correctAnswer = currentRiddle.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      // Correct answer
      const newCorrectAnswers = gameState.correctAnswers + 1;
      
      if (newCorrectAnswers >= 3) {
        // Victory condition
        setGameState(prev => ({
          ...prev,
          correctAnswers: newCorrectAnswers,
          gamePhase: 'victory',
          currentGuess: '',
          message: VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]
        }));
      } else {
        // Next riddle
        setGameState(prev => ({
          ...prev,
          correctAnswers: newCorrectAnswers,
          currentRiddle: prev.currentRiddle + 1,
          currentGuess: '',
          showHint: false,
          message: 'Correct! The laboratory trembles... Choose another door.'
        }));
      }
    } else {
      // Wrong answer
      const newAttempts = gameState.attempts + 1;
      
      if (newAttempts >= gameState.maxAttempts) {
        // Failure condition
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          gamePhase: 'failure',
          currentGuess: '',
          message: 'The laboratory has claimed another victim...'
        }));
      } else {
        // Continue with penalty
        const taunt = CHUPACABRA_TAUNTS[Math.floor(Math.random() * CHUPACABRA_TAUNTS.length)];
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          currentGuess: '',
          showHint: false,
          message: taunt
        }));
      }
    }
  };

  const showHint = () => {
    setGameState(prev => ({
      ...prev,
      showHint: true,
      message: 'A whisper from the darkness reveals a clue...'
    }));
  };

  const resetGame = () => {
    setGameState({
      currentRiddle: 0,
      correctAnswers: 0,
      attempts: 0,
      maxAttempts: 5,
      gamePhase: 'intro',
      showHint: false,
      currentGuess: '',
      message: ''
    });
    setDoorGlow([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState.currentGuess.trim()) {
      submitAnswer();
    }
  };

  const currentRiddle = RIDDLES[gameState.currentRiddle];

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Creepster', cursive"
      }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/backgrounds/lab-dark-blue.png)' }}
      />

      {/* Header */}
      <div className="relative z-10 text-center py-6">
        <h1 
          className="text-4xl md:text-6xl font-bold text-red-400 mb-2"
          style={{ textShadow: '0 0 20px #ef4444' }}
        >
          LAB ESCAPE
        </h1>
        <p className="text-lg text-gray-300">
          Solve 3 riddles to escape the haunted laboratory
        </p>
      </div>

      {/* Game Stats */}
      <div className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="text-xl font-bold text-green-400">
          Solved: {gameState.correctAnswers}/3
        </div>
        <div className="text-xl font-bold text-red-400">
          Failed Attempts: {gameState.attempts}/{gameState.maxAttempts}
        </div>
      </div>

      {/* Chupacabra */}
      <div className="absolute top-20 right-8 z-20">
        <img 
          src="/chupacabra/chupacabra-2.png"
          alt="Chupacabra" 
          className="w-16 h-16 md:w-20 md:h-20"
        />
        {gameState.message && (
          <div className="absolute -left-48 top-2 bg-black bg-opacity-80 text-red-400 text-sm px-3 py-2 rounded-lg border border-red-400 max-w-48">
            {gameState.message}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        
        {/* Intro Screen */}
        {gameState.gamePhase === 'intro' && (
          <div className="text-center max-w-2xl">
            <h2 className="text-3xl text-red-400 mb-6">
              Welcome to Dr. Heinous's Laboratory
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              You are trapped in a haunted laboratory. Three mysterious doors guard your escape.
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Behind each door lies a riddle. Solve 3 riddles to escape, but beware - 
              5 wrong answers and you become a permanent resident!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xl rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              style={{ 
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
              }}
            >
              ENTER THE LABORATORY
            </button>
          </div>
        )}

        {/* Riddle Screen */}
        {gameState.gamePhase === 'riddle' && (
          <div className="w-full max-w-4xl">
            {/* Doors */}
            <div className="flex justify-center mb-8 gap-8">
              {[0, 1, 2].map((doorIndex) => (
                <div
                  key={doorIndex}
                  className={`w-24 h-32 md:w-32 md:h-40 bg-gradient-to-b from-amber-800 to-amber-900 border-4 border-amber-600 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                    doorGlow[doorIndex] && Date.now() - doorGlow[doorIndex] < 1000 ? 'animate-pulse' : ''
                  }`}
                  onClick={() => selectDoor(doorIndex)}
                  style={{
                    boxShadow: doorGlow[doorIndex] && Date.now() - doorGlow[doorIndex] < 1000 
                      ? '0 0 20px #f59e0b' 
                      : '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🚪
                  </div>
                  <div className="text-center text-amber-400 font-bold mt-2">
                    Door {doorIndex + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Riddle */}
            {currentRiddle && (
              <div className="bg-black bg-opacity-60 border-2 border-purple-400 rounded-lg p-6 md:p-8 mb-6">
                <h3 className="text-2xl text-purple-400 mb-4 text-center">
                  Riddle #{gameState.currentRiddle + 1}
                </h3>
                <p className="text-lg text-gray-300 mb-6 text-center leading-relaxed">
                  {currentRiddle.question}
                </p>

                {/* Hint */}
                {gameState.showHint && (
                  <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg p-4 mb-6">
                    <p className="text-yellow-300 text-center">
                      💡 {currentRiddle.hint}
                    </p>
                  </div>
                )}

                {/* Answer Input */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <input
                    type="text"
                    value={gameState.currentGuess}
                    onChange={(e) => setGameState(prev => ({ ...prev, currentGuess: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your answer..."
                    className="px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg text-white text-center focus:border-purple-400 focus:outline-none flex-1 max-w-xs"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={submitAnswer}
                      disabled={!gameState.currentGuess.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg border-2 border-green-400 hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Submit
                    </button>
                    
                    {!gameState.showHint && (
                      <button
                        onClick={showHint}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-bold rounded-lg border-2 border-yellow-400 hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200"
                      >
                        Hint
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Victory Screen */}
        {gameState.gamePhase === 'victory' && (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl text-green-400 mb-4">ESCAPE SUCCESSFUL!</h2>
            <p className="text-2xl text-green-300 mb-2">
              You solved {gameState.correctAnswers} riddles!
            </p>
            <p className="text-lg text-yellow-400 mb-6">
              Failed attempts: {gameState.attempts}/{gameState.maxAttempts}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg border-2 border-green-400 hover:from-green-500 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                ESCAPE AGAIN
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Return to Game
              </button>
            </div>
          </div>
        )}

        {/* Failure Screen */}
        {gameState.gamePhase === 'failure' && (
          <div className="text-center">
            <div className="text-6xl mb-6">💀</div>
            <h2 className="text-4xl text-red-400 mb-4">TRAPPED FOREVER!</h2>
            <p className="text-xl text-red-300 mb-2">
              The laboratory has claimed another victim...
            </p>
            <p className="text-lg text-yellow-400 mb-6">
              You solved {gameState.correctAnswers}/3 riddles before failing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                TRY AGAIN
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Return to Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}