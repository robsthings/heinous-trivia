import { useState, useEffect } from 'react';

type GamePhase = 'intro' | 'sequence' | 'gameplay' | 'win' | 'fail';

interface GameState {
  phase: GamePhase;
  sequenceStep: number;
  currentPattern: number[];
  playerInput: number[];
  roundsWon: number;
  roundsPlayed: number;
  showingPattern: boolean;
  patternIndex: number;
}

export function Crime() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'intro',
    sequenceStep: 0,
    currentPattern: [],
    playerInput: [],
    roundsWon: 0,
    roundsPlayed: 0,
    showingPattern: false,
    patternIndex: 0
  });

  const [flickerActive, setFlickerActive] = useState(false);

  // Generate random pattern of 3-6 glyphs
  const generatePattern = () => {
    const length = Math.floor(Math.random() * 4) + 3; // 3-6 symbols
    const pattern = [];
    for (let i = 0; i < length; i++) {
      pattern.push(Math.floor(Math.random() * 6) + 1); // 1-6 for glyph numbers
    }
    return pattern;
  };

  // Start sequence animation
  const startSequence = () => {
    setGameState(prev => ({ ...prev, phase: 'sequence', sequenceStep: 1 }));
  };

  // Progress through sequence steps
  useEffect(() => {
    if (gameState.phase === 'sequence' && gameState.sequenceStep > 0) {
      const timer = setTimeout(() => {
        if (gameState.sequenceStep < 3) {
          setGameState(prev => ({ ...prev, sequenceStep: prev.sequenceStep + 1 }));
        } else {
          // Start gameplay
          const newPattern = generatePattern();
          setGameState(prev => ({
            ...prev,
            phase: 'gameplay',
            currentPattern: newPattern,
            playerInput: [],
            showingPattern: true,
            patternIndex: 0
          }));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.sequenceStep]);

  // Show pattern to player
  useEffect(() => {
    if (gameState.showingPattern && gameState.patternIndex < gameState.currentPattern.length) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, patternIndex: prev.patternIndex + 1 }));
      }, 800);
      return () => clearTimeout(timer);
    } else if (gameState.showingPattern && gameState.patternIndex >= gameState.currentPattern.length) {
      // Pattern shown completely, allow player input
      setGameState(prev => ({ ...prev, showingPattern: false }));
    }
  }, [gameState.showingPattern, gameState.patternIndex, gameState.currentPattern.length]);

  // Handle glyph click
  const handleGlyphClick = (glyphNumber: number) => {
    if (gameState.showingPattern) return;

    const newPlayerInput = [...gameState.playerInput, glyphNumber];
    const currentIndex = gameState.playerInput.length;
    
    // Check if current input matches pattern
    if (glyphNumber !== gameState.currentPattern[currentIndex]) {
      // Wrong input - trigger fail
      triggerFail();
      return;
    }

    setGameState(prev => ({ ...prev, playerInput: newPlayerInput }));

    // Check if pattern completed correctly
    if (newPlayerInput.length === gameState.currentPattern.length) {
      // Round won
      const newRoundsWon = gameState.roundsWon + 1;
      const newRoundsPlayed = gameState.roundsPlayed + 1;

      if (newRoundsWon >= 3) {
        // Game won
        setGameState(prev => ({ ...prev, phase: 'win' }));
      } else if (newRoundsPlayed >= 5 && newRoundsWon < 3) {
        // Game lost (didn't win 3 out of 5)
        triggerFail();
      } else {
        // Start next round
        setTimeout(() => {
          const newPattern = generatePattern();
          setGameState(prev => ({
            ...prev,
            currentPattern: newPattern,
            playerInput: [],
            roundsWon: newRoundsWon,
            roundsPlayed: newRoundsPlayed,
            showingPattern: true,
            patternIndex: 0
          }));
        }, 1000);
      }
    }
  };

  // Trigger fail sequence
  const triggerFail = () => {
    setFlickerActive(true);
    setTimeout(() => {
      setFlickerActive(false);
      setGameState(prev => ({ ...prev, phase: 'fail' }));
    }, 500);
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      phase: 'intro',
      sequenceStep: 0,
      currentPattern: [],
      playerInput: [],
      roundsWon: 0,
      roundsPlayed: 0,
      showingPattern: false,
      patternIndex: 0
    });
    setFlickerActive(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: gameState.phase === 'intro' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : `url("/sidequests/crime/game-board.png")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* Flicker overlay for fail transition */}
      {flickerActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          zIndex: 9998,
          animation: 'staticFlicker 0.1s infinite'
        }} />
      )}

      {/* Intro Phase */}
      {gameState.phase === 'intro' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 'bold',
            color: '#ff0000',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontFamily: 'Creepster, cursive',
            marginBottom: '1rem'
          }}>
            C.R.I.M.E.
          </h1>
          
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#e5e7eb',
            marginBottom: '2rem',
            maxWidth: '600px'
          }}>
            Control Room Interactive Memory Experiment
          </p>

          <img
            src="/sidequests/crime/crime-keep-out.png"
            alt="Crime Keep Out"
            onClick={startSequence}
            style={{
              width: 'clamp(300px, 50vw, 500px)',
              height: 'auto',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '3px solid #ff0000',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(255,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,0,0.3)';
            }}
          />
        </div>
      )}

      {/* Sequence Phase */}
      {gameState.phase === 'sequence' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            width: 'clamp(400px, 60vw, 600px)',
            height: 'clamp(300px, 45vw, 450px)'
          }}>
            {/* Control room background */}
            <img
              src={`/sidequests/crime/control-room-${gameState.sequenceStep}.gif`}
              alt={`Control Room ${gameState.sequenceStep}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
            
            {/* Book overlay centered on podium */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30%',
              height: '30%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={`/sidequests/crime/book-${gameState.sequenceStep}.png`}
                alt={`Book ${gameState.sequenceStep}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  animation: 'bookReveal 2s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{
            fontSize: '1.2rem',
            color: '#e5e7eb',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            Analyzing security protocols... Step {gameState.sequenceStep}/3
          </p>
        </div>
      )}

      {/* Gameplay Phase */}
      {gameState.phase === 'gameplay' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          width: '100%',
          maxWidth: '800px'
        }}>
          {/* Round counter */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '1rem 2rem',
            borderRadius: '10px',
            border: '2px solid #00ff00'
          }}>
            <p style={{
              color: '#00ff00',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: 0
            }}>
              Round {gameState.roundsPlayed + 1}/5 - Wins: {gameState.roundsWon}/3
            </p>
          </div>

          {/* Pattern display message */}
          {gameState.showingPattern && (
            <p style={{
              color: '#ffff00',
              fontSize: '1.1rem',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              animation: 'pulse 1s infinite'
            }}>
              MEMORIZE THE SEQUENCE...
            </p>
          )}

          {!gameState.showingPattern && (
            <p style={{
              color: '#00ff00',
              fontSize: '1.1rem',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              INPUT THE SEQUENCE
            </p>
          )}

          {/* Glyph grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1rem, 3vw, 2rem)',
            width: '100%',
            maxWidth: '400px'
          }}>
            {[1, 2, 3, 4, 5, 6].map((glyphNum) => {
              const isHighlighted = gameState.showingPattern && 
                gameState.patternIndex > 0 && 
                gameState.currentPattern[gameState.patternIndex - 1] === glyphNum;

              return (
                <button
                  key={glyphNum}
                  onClick={() => handleGlyphClick(glyphNum)}
                  disabled={gameState.showingPattern}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: gameState.showingPattern ? 'default' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    transform: isHighlighted ? 'scale(1.2)' : 'scale(1)',
                    filter: isHighlighted ? 'brightness(1.5) saturate(1.5)' : 'brightness(1)',
                    boxShadow: isHighlighted ? '0 0 20px rgba(0,255,0,0.8)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!gameState.showingPattern) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.filter = 'brightness(1.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!gameState.showingPattern) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.filter = 'brightness(1)';
                    }
                  }}
                >
                  <img
                    src={`/sidequests/crime/glyph-${glyphNum}.png`}
                    alt={`Glyph ${glyphNum}`}
                    style={{
                      width: 'clamp(60px, 12vw, 100px)',
                      height: 'clamp(60px, 12vw, 100px)',
                      objectFit: 'contain'
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Player input display */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            minHeight: '2rem'
          }}>
            {gameState.playerInput.map((glyphNum, index) => (
              <img
                key={index}
                src={`/sidequests/crime/glyph-${glyphNum}.png`}
                alt={`Input ${glyphNum}`}
                style={{
                  width: '30px',
                  height: '30px',
                  objectFit: 'contain',
                  border: '1px solid #00ff00',
                  borderRadius: '3px',
                  background: 'rgba(0,255,0,0.1)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fail Phase */}
      {gameState.phase === 'fail' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '3rem',
            borderRadius: '15px',
            border: '3px solid #ff0000',
            textAlign: 'center',
            animation: 'redFlash 1s infinite'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              color: '#ff0000',
              fontWeight: 'bold',
              fontFamily: 'Creepster, cursive',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              marginBottom: '1rem'
            }}>
              ALERT: UNAUTHORIZED ACCESS DETECTED
            </h2>

            <p style={{
              fontSize: '1.2rem',
              color: '#e5e7eb',
              marginBottom: '2rem'
            }}>
              Dr. Heinous is approaching...
            </p>

            <button
              onClick={resetGame}
              style={{
                background: 'linear-gradient(45deg, #7f1d1d, #dc2626)',
                border: '2px solid #ffffff',
                borderRadius: '0.5rem',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
              }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Win Phase */}
      {gameState.phase === 'win' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,255,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 1s ease-in'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '3rem',
            borderRadius: '15px',
            border: '3px solid #00ff00',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(0,255,0,0.5)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              color: '#00ff00',
              fontWeight: 'bold',
              fontFamily: 'Creepster, cursive',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              marginBottom: '1rem'
            }}>
              ACCESS GRANTED
            </h2>

            <p style={{
              fontSize: '1.2rem',
              color: '#e5e7eb',
              marginBottom: '2rem'
            }}>
              CONTROL ROOM BREACHED
            </p>

            <button
              onClick={() => window.location.href = '/game/headquarters'}
              style={{
                background: 'linear-gradient(45deg, #15803d, #22c55e)',
                border: '2px solid #ffffff',
                borderRadius: '0.5rem',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
              }}
            >
              RETURN TO GAME
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes staticFlicker {
            0% { opacity: 0.1; }
            50% { opacity: 0.3; }
            100% { opacity: 0.1; }
          }
          @keyframes redFlash {
            0%, 100% { border-color: #ff0000; box-shadow: 0 0 20px rgba(255,0,0,0.5); }
            50% { border-color: #ff6666; box-shadow: 0 0 40px rgba(255,0,0,0.8); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes bookReveal {
            0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
            50% { opacity: 0.8; transform: scale(1.1) rotate(5deg); }
            100% { opacity: 1; transform: scale(1) rotate(0deg); }
          }
        `
      }} />
    </div>
  );
}