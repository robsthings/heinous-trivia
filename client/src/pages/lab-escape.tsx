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
      <div >
        <img 
          src="/sidequests/lab-escape/fail.png" 
          alt="Prison Fail Screen"
          
        />
        
        <div >
          <div >
            <div >
              <button
                onClick={resetGame}
                
              >
                Try Again
              </button>
              <Link
                href="/game"
                
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
    <div >
      {/* Background */}
      <img 
        src="/sidequests/lab-escape/bg-room.png" 
        alt="Laboratory Room"
        
      />
      
      {/* Win Banner */}
      {gameState.gameWon && (
        <div >
          <div >
            <img 
              src="/sidequests/lab-escape/banner.png" 
              alt="Victory Banner"
              
            />
            
            {/* Confetti effects */}
            <img 
              src="/sidequests/lab-escape/confetti.gif" 
              alt="Confetti"
              
            />
            
            <div >
              <Link
                href="/game/headquarters"
                
              >
                🎮 Return to Game
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
            
            style={{ 
              animation: 'door-glow 3s ease-in-out infinite',
              animationDelay: '0s'
            }}
            onClick={() => handleDoorClick(1)}
          />
          <img 
            src="/sidequests/lab-escape/door-2.png" 
            alt="Door 2"
            
            style={{ 
              animation: 'door-glow 2.5s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
            onClick={() => handleDoorClick(2)}
          />
          <img 
            src="/sidequests/lab-escape/door-3.png" 
            alt="Door 3"
            
            style={{ 
              animation: 'door-glow 3.5s ease-in-out infinite',
              animationDelay: '1s'
            }}
            onClick={() => handleDoorClick(3)}
          />
        </>
      )}

      {/* Score Display */}
      <div >
        <div >
          <div >
            ESCAPE PROGRESS
          </div>
          <div >
            Correct: {gameState.correctAnswers}/3
          </div>
          <div >
            Attempts: {gameState.totalAttempts}/5
          </div>
        </div>
      </div>

      {/* Chupacabra Taunts */}
      {gameState.chupacabraMessage && (
        <div >
          <div >
            <img 
              src={`/chupacabra/${gameState.selectedChupacabra}`} 
              alt="Chupacabra"
              
            />
            <div >
              <div  style={{textAlign: "center"}}>
                {gameState.chupacabraMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Riddle Input Modal */}
      {gameState.showInput && gameState.currentRiddle && (
        <div >
          <div >
            {/* Glowing border effect */}
            <div ></div>
            
            {/* Main card */}
            <div >
              {/* Floating particles effect */}
              <div >
                <div ></div>
                <div  style={{ animationDelay: '0.5s' }}></div>
                <div  style={{ animationDelay: '1s' }}></div>
                <div  style={{ animationDelay: '1.5s' }}></div>
              </div>
              
              {/* Content */}
              <div >
                <h2  style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}} style={{ fontFamily: 'Creepster, cursive' }}>
                  ⚡ RIDDLE OF THE LAB ⚡
                </h2>
                
                <div  style={{marginBottom: "1.5rem"}}>
                  <p  style={{textAlign: "center"}}>
                    {gameState.currentRiddle.question}
                  </p>
                  
                  {gameState.currentRiddle.hint && (
                    <div >
                      <p  style={{textAlign: "center"}}>
                        <span >💡</span>
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
                   style={{marginBottom: "1.5rem"}}
                  autoFocus
                />
                
                <div >
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!gameState.userAnswer.trim()}
                    
                  >
                    🔬 Submit
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showInput: false, currentRiddle: null, userAnswer: '' }))}
                    
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
        <div >
          <div  style={{textAlign: "center"}}>
            <div >
              ESCAPE THE LAB
            </div>
            <div >
              Click doors to solve riddles • Get 3 correct before 5 attempts
            </div>
          </div>
        </div>
      )}
    </div>
  );
}