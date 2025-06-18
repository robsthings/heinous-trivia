import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import riddlesData from '../data/riddles.json';

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

// Convert riddles data to match our interface format
const RIDDLES: Riddle[] = riddlesData.map(riddle => ({
  id: parseInt(riddle.id),
  question: riddle.question,
  answer: riddle.answer.toLowerCase(),
  hint: "Dr. Heinous whispers: Think carefully about the wording..."
}));

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
        
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="pb-8">
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
            className="absolute top-1/2 left-8 transform -translate-y-1/2 w-48 h-auto cursor-pointer transition-all duration-200 hover:brightness-110"
            style={{ 
              animation: 'door-glow 3s ease-in-out infinite',
              animationDelay: '0s'
            }}
            onClick={() => handleDoorClick(1)}
          />
          <img 
            src="/sidequests/lab-escape/door-2.png" 
            alt="Door 2"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full w-48 h-auto cursor-pointer transition-all duration-200 hover:brightness-110"
            style={{ 
              animation: 'door-glow 2.5s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
            onClick={() => handleDoorClick(2)}
          />
          <img 
            src="/sidequests/lab-escape/door-3.png" 
            alt="Door 3"
            className="absolute top-1/2 right-8 transform -translate-y-1/2 w-48 h-auto cursor-pointer transition-all duration-200 hover:brightness-110"
            style={{ 
              animation: 'door-glow 3.5s ease-in-out infinite',
              animationDelay: '1s'
            }}
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
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="bg-red-900 bg-opacity-95 border-2 border-red-400 rounded-lg p-3 text-white text-xs max-w-48 text-center">
                {gameState.chupacabraMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Riddle Input Modal */}
      {gameState.showInput && gameState.currentRiddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
          <div className="relative max-w-lg mx-4 animate-in fade-in zoom-in duration-500">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-yellow-500 to-purple-600 rounded-xl blur opacity-75 animate-pulse"></div>
            
            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 border-yellow-500 rounded-xl p-8 shadow-2xl">
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-6 left-8 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-yellow-400 font-bold text-2xl mb-6 text-center tracking-wider drop-shadow-lg" style={{ fontFamily: 'Creepster, cursive' }}>
                  ⚡ RIDDLE OF THE LAB ⚡
                </h2>
                
                <div className="bg-black bg-opacity-50 rounded-lg p-6 mb-6 border border-yellow-500/30">
                  <p className="text-white text-lg mb-4 text-center leading-relaxed font-medium">
                    {gameState.currentRiddle.question}
                  </p>
                  
                  {gameState.currentRiddle.hint && (
                    <div className="border-t border-gray-600 pt-4">
                      <p className="text-amber-300 text-sm italic text-center flex items-center justify-center gap-2">
                        <span className="text-yellow-400">💡</span>
                        <span>Hint: {gameState.currentRiddle.hint}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  type="text"
                  value={gameState.userAnswer}
                  onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white text-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none mb-6 shadow-inner transition-all duration-200"
                  autoFocus
                />
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!gameState.userAnswer.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    🔬 Submit
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showInput: false, currentRiddle: null, userAnswer: '' }))}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                  >
                    🚪 Escape
                  </button>
                </div>
              </div>
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