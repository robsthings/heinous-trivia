import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface GameState {
  correctAnswers: number;
  totalAttempts: number;
  currentRiddle: Riddle | null;
  showInput: boolean;
  userAnswer: string;
  gameWon: boolean;
  gameFailed: boolean;
  showConfetti: boolean;
  chupacabraMessage: string | null;
  selectedChupacabra: string;
}

interface Riddle {
  id: number;
  question: string;
  answer: string;
  hint?: string;
}

const RIDDLES: Riddle[] = [
  {
    id: 1,
    question: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?",
    answer: "keyboard",
    hint: "Dr. Heinous types his evil schemes on this..."
  },
  {
    id: 2,
    question: "What gets wetter the more it dries?",
    answer: "towel",
    hint: "Found in the lab's decontamination chamber..."
  },
  {
    id: 3,
    question: "I'm tall when I'm young, and short when I'm old. What am I?",
    answer: "candle",
    hint: "Flickering light in the haunted laboratory..."
  },
  {
    id: 4,
    question: "What has many teeth but cannot bite?",
    answer: "saw",
    hint: "Dr. Heinous's favorite cutting tool..."
  },
  {
    id: 5,
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    hint: "Evidence of your escape attempt..."
  },
  {
    id: 6,
    question: "What can travel around the world while staying in a corner?",
    answer: "stamp",
    hint: "Found on Dr. Heinous's evil correspondence..."
  },
  {
    id: 7,
    question: "I have a head and a tail, but no body. What am I?",
    answer: "coin",
    hint: "Currency from the realm of the living..."
  },
  {
    id: 8,
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "m",
    hint: "Look at the letters themselves..."
  }
];

const CHUPACABRA_TAUNTS = [
  "Wrong! Even I could answer that one.",
  "Nope! Try using that brain of yours.",
  "Incorrect! The Chupacabra is disappointed.",
  "Wrong answer! I've seen smarter lab rats.",
  "Nah, that ain't it, chief.",
  "Bzzt! Wrong! Back to riddle school.",
  "Negative! Even my cousin got that one.",
  "Wrong! Dr. Heinous would be ashamed."
];

const CHUPACABRA_SPRITES = ['chupacabra-3.png', 'chupacabra-5.png', 'chupacabra-7.png'];

const INITIAL_STATE: GameState = {
  correctAnswers: 0,
  totalAttempts: 0,
  currentRiddle: null,
  showInput: false,
  userAnswer: '',
  gameWon: false,
  gameFailed: false,
  showConfetti: false,
  chupacabraMessage: null,
  selectedChupacabra: CHUPACABRA_SPRITES[Math.floor(Math.random() * CHUPACABRA_SPRITES.length)]
};

export function LabEscape() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [usedRiddles, setUsedRiddles] = useState<number[]>([]);

  // Hide Chupacabra message after delay
  useEffect(() => {
    if (gameState.chupacabraMessage) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, chupacabraMessage: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.chupacabraMessage]);

  // Trigger confetti effect
  useEffect(() => {
    if (gameState.showConfetti) {
      // Replit confetti API
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, showConfetti: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.showConfetti]);

  const getRandomRiddle = () => {
    const availableRiddles = RIDDLES.filter(riddle => !usedRiddles.includes(riddle.id));
    if (availableRiddles.length === 0) {
      // If all riddles used, reset the pool
      setUsedRiddles([]);
      return RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    }
    return availableRiddles[Math.floor(Math.random() * availableRiddles.length)];
  };

  const handleDoorClick = (doorNumber: number) => {
    if (gameState.showInput || gameState.gameWon || gameState.gameFailed) return;
    
    const riddle = getRandomRiddle();
    setUsedRiddles(prev => [...prev, riddle.id]);
    setGameState(prev => ({
      ...prev,
      currentRiddle: riddle,
      showInput: true,
      userAnswer: '',
      chupacabraMessage: null
    }));
  };

  const handleSubmitAnswer = () => {
    if (!gameState.currentRiddle) return;

    const isCorrect = gameState.userAnswer.toLowerCase().trim() === gameState.currentRiddle.answer.toLowerCase();
    const newTotalAttempts = gameState.totalAttempts + 1;
    const newCorrectAnswers = isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers;

    if (isCorrect) {
      // Check win condition
      if (newCorrectAnswers >= 3) {
        setGameState(prev => ({
          ...prev,
          correctAnswers: newCorrectAnswers,
          totalAttempts: newTotalAttempts,
          gameWon: true,
          showInput: false,
          currentRiddle: null,
          showConfetti: true
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          correctAnswers: newCorrectAnswers,
          totalAttempts: newTotalAttempts,
          showInput: false,
          currentRiddle: null,
          userAnswer: ''
        }));
      }
    } else {
      // Wrong answer
      const randomTaunt = CHUPACABRA_TAUNTS[Math.floor(Math.random() * CHUPACABRA_TAUNTS.length)];
      
      // Check fail condition
      if (newTotalAttempts >= 5 && newCorrectAnswers < 3) {
        setGameState(prev => ({
          ...prev,
          totalAttempts: newTotalAttempts,
          gameFailed: true,
          showInput: false,
          currentRiddle: null
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          totalAttempts: newTotalAttempts,
          showInput: false,
          currentRiddle: null,
          userAnswer: '',
          chupacabraMessage: randomTaunt
        }));
      }
    }
  };

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setUsedRiddles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  // Fail screen
  if (gameState.gameFailed) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <img 
          src="/sidequests/lab-escape/fail.png" 
          alt="Prison Fail Screen"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4 animate-pulse">
              CAPTURED!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              "Whatcha in for?"
            </p>
            
            <div className="space-x-4">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Try Again
              </button>
              <Link
                href="/game"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg inline-block"
              >
                Back to Game
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <img 
        src="/sidequests/lab-escape/bg-room.png" 
        alt="Laboratory Room"
        className="w-full h-full object-cover"
      />
      
      {/* Win Banner */}
      {gameState.gameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative">
            <img 
              src="/sidequests/lab-escape/banner.png" 
              alt="Victory Banner"
              className="max-w-full max-h-full object-contain animate-pulse"
            />
            
            {/* Sparkling effects */}
            <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-20 w-5 h-5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Link
                href="/game"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg inline-block"
              >
                Back to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Doors */}
      {!gameState.gameWon && !gameState.gameFailed && (
        <>
          <img 
            src="/sidequests/lab-escape/door-1.png" 
            alt="Door 1"
            className="absolute top-1/3 left-16 w-36 h-48 cursor-pointer hover:animate-pulse transition-all duration-200 hover:brightness-110"
            onClick={() => handleDoorClick(1)}
          />
          <img 
            src="/sidequests/lab-escape/door-2.png" 
            alt="Door 2"
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-36 h-48 cursor-pointer hover:animate-pulse transition-all duration-200 hover:brightness-110"
            onClick={() => handleDoorClick(2)}
          />
          <img 
            src="/sidequests/lab-escape/door-3.png" 
            alt="Door 3"
            className="absolute top-1/3 right-16 w-36 h-48 cursor-pointer hover:animate-pulse transition-all duration-200 hover:brightness-110"
            onClick={() => handleDoorClick(3)}
          />
        </>
      )}

      {/* Score Display */}
      <div className="absolute top-4 left-4 z-30">
        <div className="bg-black bg-opacity-80 border-2 border-yellow-600 rounded-lg p-4">
          <div className="text-yellow-400 font-mono text-sm">
            ESCAPE PROGRESS
          </div>
          <div className="text-white font-mono">
            Correct: {gameState.correctAnswers}/3
          </div>
          <div className="text-white font-mono">
            Attempts: {gameState.totalAttempts}/5
          </div>
        </div>
      </div>

      {/* Chupacabra Taunts */}
      {gameState.chupacabraMessage && (
        <div className="fixed bottom-8 right-8 z-40 animate-bounce">
          <div className="relative">
            <img 
              src={`/chupacabra/${gameState.selectedChupacabra}`} 
              alt="Chupacabra"
              className="w-32 h-32"
            />
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-red-900 bg-opacity-95 border-2 border-red-400 rounded-lg p-2 text-white text-xs max-w-40">
                {gameState.chupacabraMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Riddle Input Modal */}
      {gameState.showInput && gameState.currentRiddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-900 border-4 border-yellow-600 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-yellow-400 font-bold text-xl mb-4 text-center">
              RIDDLE
            </h2>
            
            <p className="text-white text-lg mb-6 text-center">
              {gameState.currentRiddle.question}
            </p>
            
            {gameState.currentRiddle.hint && (
              <p className="text-gray-400 text-sm mb-4 italic text-center">
                Hint: {gameState.currentRiddle.hint}
              </p>
            )}
            
            <input
              type="text"
              value={gameState.userAnswer}
              onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Enter your answer..."
              className="w-full p-3 bg-gray-800 border-2 border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none mb-4"
              autoFocus
            />
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSubmitAnswer}
                disabled={!gameState.userAnswer.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded transition-colors duration-200"
              >
                Submit
              </button>
              <button
                onClick={() => setGameState(prev => ({ ...prev, showInput: false, currentRiddle: null, userAnswer: '' }))}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameState.showInput && !gameState.gameWon && !gameState.gameFailed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black bg-opacity-80 border-2 border-yellow-600 rounded-lg p-4 text-center">
            <div className="text-yellow-400 font-mono text-sm mb-2">
              ESCAPE THE LAB
            </div>
            <div className="text-white text-xs">
              Click doors to solve riddles • Get 3 correct before 5 attempts
            </div>
          </div>
        </div>
      )}
    </div>
  );
}