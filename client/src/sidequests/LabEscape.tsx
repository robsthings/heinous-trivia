import React, { useState, useEffect } from 'react';
// @ts-ignore
import riddlesData from '../data/riddles.json';

interface Riddle {
  id: string;
  question: string;
  answer: string;
}

interface GameState {
  currentRiddle: Riddle | null;
  correctAnswers: number;
  attempts: number;
  maxAttempts: number;
  gamePhase: 'intro' | 'riddle' | 'victory' | 'failure';
  showHint: boolean;
  currentGuess: string;
  message: string;
  usedRiddles: string[];
  selectedDoor: number | null;
  failAnimationPhase: 'none' | 'falling' | 'landed' | 'complete';
}

// Convert riddles data and add horror-themed hints
const RIDDLES: Riddle[] = riddlesData.map(riddle => ({
  id: riddle.id,
  question: riddle.question,
  answer: riddle.answer.toLowerCase().trim()
}));



const CHUPACABRA_TAUNTS = [
  "Wrong again, foolish mortal!",
  "Your mind crumbles in the darkness!",
  "The laboratory claims another victim!",
  "Failure feeds the shadows!",
  "Think harder, if your brain still functions!",
  "Your escape grows more distant!",
  "Another wrong turn in the abyss!",
  "The riddles mock your feeble intellect!"
];

const VICTORY_MESSAGES = [
  "Impossible! You've escaped the nightmare!",
  "The laboratory doors creak open...",
  "Your wit has conquered the darkness!",
  "Freedom awaits beyond these cursed walls!"
];

const HORROR_HINTS = [
  "Dr. Heinous whispers: Think carefully about the wording...",
  "The shadows reveal: Look deeper into the meaning...",
  "A ghostly voice echoes: The answer hides in plain sight...",
  "The laboratory spirits suggest: Consider the literal and metaphorical...",
  "An otherworldly presence hints: Break down the question...",
  "The darkness murmurs: What seems obvious may be correct...",
  "Spectral guidance: Focus on the key words...",
  "The void speaks: Sometimes simple answers are right..."
];

export function LabEscape() {
  // Add floating animation styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes mysticalFloat1 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-8px) rotate(0.5deg); }
        50% { transform: translateY(-4px) rotate(0deg); }
        75% { transform: translateY(-12px) rotate(-0.5deg); }
      }
      @keyframes mysticalFloat2 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-6px) rotate(-0.3deg); }
        66% { transform: translateY(-10px) rotate(0.3deg); }
      }
      @keyframes mysticalFloat3 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        20% { transform: translateY(-5px) rotate(0.4deg); }
        40% { transform: translateY(-15px) rotate(0deg); }
        60% { transform: translateY(-8px) rotate(-0.4deg); }
        80% { transform: translateY(-3px) rotate(0.2deg); }
      }
      @keyframes trapDoorFall {
        0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
        70% { transform: translateY(-10px) scale(1.1); opacity: 1; }
        85% { transform: translateY(5px) scale(0.95); }
        100% { transform: translateY(0px) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    currentRiddle: null,
    correctAnswers: 0,
    attempts: 0,
    maxAttempts: 5,
    gamePhase: 'intro',
    showHint: false,
    currentGuess: '',
    message: '',
    usedRiddles: [],
    selectedDoor: null,
    failAnimationPhase: 'none'
  });

  // Handle trap door fall animation sequence
  React.useEffect(() => {
    if (gameState.failAnimationPhase === 'falling') {
      // After animation completes (1.5s), show the landed state
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          failAnimationPhase: 'landed'
        }));
      }, 1500);

      // After a brief pause, show the complete state with buttons
      const completeTimer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          failAnimationPhase: 'complete'
        }));
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [gameState.failAnimationPhase]);

  const getRandomRiddle = () => {
    const availableRiddles = RIDDLES.filter(riddle => !gameState.usedRiddles.includes(riddle.id));
    if (availableRiddles.length === 0) {
      // Reset pool if all riddles used
      setGameState(prev => ({ ...prev, usedRiddles: [] }));
      return RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    }
    return availableRiddles[Math.floor(Math.random() * availableRiddles.length)];
  };

  const handleDoorClick = (doorNumber: number) => {
    if (gameState.gamePhase !== 'intro' || gameState.selectedDoor !== null) return;
    
    const riddle = getRandomRiddle();
    setGameState(prev => ({
      ...prev,
      currentRiddle: riddle,
      usedRiddles: [...prev.usedRiddles, riddle.id],
      gamePhase: 'riddle',
      selectedDoor: doorNumber,
      showHint: false,
      currentGuess: '',
      message: ''
    }));
  };

  const handleSubmitAnswer = () => {
    if (!gameState.currentRiddle) return;

    const userAnswer = gameState.currentGuess.toLowerCase().trim();
    const correctAnswer = gameState.currentRiddle.answer.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer;
    
    const newAttempts = gameState.attempts + 1;

    if (isCorrect) {
      // Correct answer - move to next riddle
      const newCorrectAnswers = gameState.correctAnswers + 1;
      
      if (newCorrectAnswers >= 3) {
        // Victory condition
        setGameState(prev => ({
          ...prev,
          correctAnswers: newCorrectAnswers,
          attempts: newAttempts,
          gamePhase: 'victory',
          message: VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]
        }));
      } else {
        // Continue playing - back to door selection
        setGameState(prev => ({
          ...prev,
          correctAnswers: newCorrectAnswers,
          attempts: newAttempts,
          gamePhase: 'intro',
          currentRiddle: null,
          selectedDoor: null,
          currentGuess: '',
          showHint: false,
          message: `Correct! ${3 - newCorrectAnswers} more to escape...`
        }));
      }
    } else {
      // Wrong answer - one attempt per riddle, move back to door selection
      if (newAttempts >= gameState.maxAttempts) {
        // Game over - too many wrong attempts total - start trap door animation
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          gamePhase: 'failure',
          failAnimationPhase: 'falling',
          message: CHUPACABRA_TAUNTS[Math.floor(Math.random() * CHUPACABRA_TAUNTS.length)]
        }));
      } else {
        // Wrong answer - back to door selection for new riddle
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          gamePhase: 'intro',
          currentRiddle: null,
          selectedDoor: null,
          currentGuess: '',
          showHint: false,
          message: CHUPACABRA_TAUNTS[Math.floor(Math.random() * CHUPACABRA_TAUNTS.length)]
        }));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const resetGame = () => {
    setGameState({
      currentRiddle: null,
      correctAnswers: 0,
      attempts: 0,
      maxAttempts: 5,
      gamePhase: 'intro',
      showHint: false,
      currentGuess: '',
      message: '',
      usedRiddles: [],
      selectedDoor: null
    });
  };

  const navigateToGame = () => {
    window.location.href = '/game/headquarters';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      backgroundImage: `url('/sidequests/lab-escape/bg-room.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '20'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontFamily: 'Creepster, cursive',
          color: '#ff6b35',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255, 107, 53, 0.8), 0 0 40px rgba(255, 107, 53, 0.6)',
          marginBottom: '0.5rem',
          letterSpacing: '0.1em'
        }}>
          LAB ESCAPE
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
          color: '#d1d5db',
          textAlign: 'center',
          margin: '0'
        }}>
          Solve 3 riddles to escape the cursed laboratory
        </p>
      </div>



      {/* Message Display */}
      {gameState.message && (
        <div style={{
          position: 'absolute',
          top: '12rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #a855f7',
          borderRadius: '0.75rem',
          padding: '1rem 2rem',
          maxWidth: '90%',
          zIndex: '20'
        }}>
          <p style={{
            color: '#a855f7',
            textAlign: 'center',
            margin: '0',
            fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
            fontWeight: 'bold'
          }}>
            {gameState.message}
          </p>
        </div>
      )}

      {/* Main Game Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '1',
        width: '100%',
        maxWidth: '1200px',
        marginTop: '4rem'
      }}>

        {/* Intro Phase - Door Selection */}
        {gameState.gamePhase === 'intro' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 'clamp(1rem, 4vw, 3rem)',
            flexWrap: 'wrap'
          }}>
            {[1, 2, 3].map((doorNum) => (
              <div
                key={doorNum}
                onClick={() => handleDoorClick(doorNum)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  filter: 'brightness(1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 20px rgba(255, 107, 53, 0.6))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <img
                  src={`/sidequests/lab-escape/door-${doorNum}.png`}
                  alt={`Door ${doorNum}`}
                  style={{
                    width: doorNum === 2 ? 'clamp(136px, 22.75vw, 228px)' : 'clamp(195px, 32.5vw, 325px)',
                    height: doorNum === 2 ? 'clamp(205px, 34.13vw, 341px)' : 'clamp(293px, 48.75vw, 488px)',
                    objectFit: 'contain',
                    display: 'block',
                    marginBottom: doorNum === 2 ? 'clamp(3rem, 8vw, 6rem)' : '0',
                    animation: `mysticalFloat${doorNum} ${3 + doorNum * 0.5}s ease-in-out infinite`,
                    filter: 'drop-shadow(0 4px 12px rgba(139, 0, 0, 0.3))'
                  }}
                />

              </div>
            ))}
          </div>
        )}

        {/* Riddle Phase */}
        {gameState.gamePhase === 'riddle' && gameState.currentRiddle && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '3px solid #ff6b35',
            borderRadius: '1rem',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
            width: '100%',
            maxWidth: '600px',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 0 40px rgba(255, 107, 53, 0.3)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#ff6b35',
              textAlign: 'center',
              marginBottom: '2rem',
              fontFamily: 'Creepster, cursive',
              textShadow: '0 0 15px rgba(255, 107, 53, 0.8)'
            }}>
              🚪 RIDDLE FROM DOOR {gameState.selectedDoor} 🚪
            </h2>

            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid #a855f7',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0'
              }}>
                {gameState.currentRiddle.question}
              </p>
            </div>

            {/* Hint Display */}
            {gameState.showHint && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.2)',
                border: '2px solid #a855f7',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: '#d8b4fe',
                  textAlign: 'center',
                  margin: '0',
                  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                  fontStyle: 'italic'
                }}>
                  💡 {HORROR_HINTS[Math.floor(Math.random() * HORROR_HINTS.length)]}
                </p>
              </div>
            )}

            {/* Answer Input */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <input
                type="text"
                value={gameState.currentGuess}
                onChange={(e) => setGameState(prev => ({ ...prev, currentGuess: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  border: '2px solid #6b7280',
                  borderRadius: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                onBlur={(e) => e.target.style.borderColor = '#6b7280'}
              />

              <button
                onClick={handleSubmitAnswer}
                disabled={!gameState.currentGuess.trim()}
                style={{
                  padding: '1rem 2rem',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  fontWeight: 'bold',
                  background: gameState.currentGuess.trim() ? 
                    'linear-gradient(to right, #10b981, #059669)' : 
                    'rgba(107, 114, 128, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: gameState.currentGuess.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  textShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  if (gameState.currentGuess.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                SUBMIT ANSWER
              </button>
            </div>
          </div>
        )}

        {/* Victory Phase */}
        {gameState.gamePhase === 'victory' && (
          <div style={{
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '3px solid #10b981',
            borderRadius: '1rem',
            padding: 'clamp(2rem, 5vw, 4rem)',
            maxWidth: '90%',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#10b981',
              marginBottom: '1.5rem',
              fontFamily: 'Creepster, cursive',
              textShadow: '0 0 20px rgba(16, 185, 129, 0.8)'
            }}>
              🎉 ESCAPE SUCCESSFUL! 🎉
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#ffffff',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              {gameState.message}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={resetGame}
                style={{
                  padding: '1rem 2rem',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #a855f7, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ESCAPE AGAIN
              </button>
              <button
                onClick={navigateToGame}
                style={{
                  padding: '1rem 2rem',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #ff6b35, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                RETURN TO GAME
              </button>
            </div>
          </div>
        )}

        {/* Failure Phase */}
        {gameState.gamePhase === 'failure' && (
          <div style={{
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '3px solid #ef4444',
            borderRadius: '1rem',
            padding: 'clamp(2rem, 5vw, 4rem)',
            maxWidth: '90%',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100vw',
              height: '100vh',
              zIndex: '9999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <img
                src="/sidequests/lab-escape/fail.png"
                alt="Failure"
                style={{
                  width: '100vw',
                  height: '100vh',
                  objectFit: 'cover',
                  animation: gameState.failAnimationPhase === 'falling' ? 'trapDoorFall 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none'
                }}
              />
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#ef4444',
              marginBottom: '1.5rem',
              fontFamily: 'Creepster, cursive',
              textShadow: '0 0 20px rgba(239, 68, 68, 0.8)'
            }}>
              💀 TRAPPED FOREVER! 💀
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#ffffff',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              {gameState.message}
            </p>
            {gameState.failAnimationPhase === 'complete' && (
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                onClick={resetGame}
                style={{
                  padding: '1rem 2rem',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #a855f7, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                TRY AGAIN
              </button>
              <button
                onClick={navigateToGame}
                style={{
                  padding: '1rem 2rem',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #ff6b35, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                RETURN TO GAME
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Game Status - Bottom of Page */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '2rem',
        zIndex: '20'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid #10b981',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{
            color: '#10b981',
            fontWeight: 'bold',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
          }}>
            Correct: {gameState.correctAnswers}/3
          </span>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid #ef4444',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{
            color: '#ef4444',
            fontWeight: 'bold',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
          }}>
            Attempts: {gameState.attempts}/{gameState.maxAttempts}
          </span>
        </div>
      </div>
    </div>
  );
}