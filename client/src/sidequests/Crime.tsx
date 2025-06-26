import { useState, useEffect } from 'react';

type GamePhase = 'intro' | 'sequence' | 'gameplay' | 'win' | 'fail' | 'reshuffling';

interface GameState {
  phase: GamePhase;
  sequenceStep: number;
  currentPattern: number[];
  playerInput: number[];
  roundsWon: number;
  roundsPlayed: number;
  showingPattern: boolean;
  patternIndex: number;
  canRepeat: boolean;
  patternViewCount: number;
  glyphPositions: number[];
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
    patternIndex: 0,
    canRepeat: true,
    patternViewCount: 0,
    glyphPositions: [1, 2, 3, 4, 5, 6]
  });

  const [flickerActive, setFlickerActive] = useState(false);

  // Shuffle array utility
  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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

  // Progress through sequence steps (slower timing)
  useEffect(() => {
    if (gameState.phase === 'sequence' && gameState.sequenceStep > 0) {
      const timer = setTimeout(() => {
        if (gameState.sequenceStep < 3) {
          setGameState(prev => ({ ...prev, sequenceStep: prev.sequenceStep + 1 }));
        } else {
          // Start gameplay
          const pattern = generatePattern();
          setGameState(prev => ({ 
            ...prev, 
            phase: 'gameplay', 
            currentPattern: pattern,
            playerInput: [],
            canRepeat: true,
            patternViewCount: 0
          }));
          showPattern(pattern);
        }
      }, 3000); // Slower timing - 3 seconds between each gif
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.sequenceStep]);

  // Show pattern to player
  const showPattern = (pattern: number[]) => {
    setGameState(prev => ({ 
      ...prev, 
      showingPattern: true, 
      patternIndex: 0,
      patternViewCount: prev.patternViewCount + 1
    }));
    
    let index = 0;
    const timer = setInterval(() => {
      index++;
      setGameState(prev => ({ ...prev, patternIndex: index }));
      
      if (index >= pattern.length) {
        clearInterval(timer);
        setTimeout(() => {
          setGameState(prev => ({ 
            ...prev, 
            showingPattern: false, 
            patternIndex: 0,
            canRepeat: prev.patternViewCount < 2
          }));
        }, 800);
      }
    }, 800);
  };

  // Repeat pattern (only available twice)
  const repeatPattern = () => {
    if (gameState.canRepeat && gameState.patternViewCount < 2) {
      showPattern(gameState.currentPattern);
    }
  };

  // Handle glyph click
  const handleGlyphClick = (glyphNum: number) => {
    if (gameState.showingPattern) return;

    const newInput = [...gameState.playerInput, glyphNum];
    setGameState(prev => ({ ...prev, playerInput: newInput }));

    // Check if pattern matches so far
    const isCorrectSoFar = newInput.every((input, index) => 
      input === gameState.currentPattern[index]
    );

    if (!isCorrectSoFar) {
      // Wrong - start reshuffle and new round
      handleRoundLoss();
    } else if (newInput.length === gameState.currentPattern.length) {
      // Correct complete pattern
      handleRoundWin();
    }
  };

  // Handle round win
  const handleRoundWin = () => {
    const newRoundsWon = gameState.roundsWon + 1;
    const newRoundsPlayed = gameState.roundsPlayed + 1;

    if (newRoundsWon >= 3) {
      // Game win - green flash
      setGameState(prev => ({ 
        ...prev, 
        phase: 'win', 
        roundsWon: newRoundsWon,
        roundsPlayed: newRoundsPlayed
      }));
    } else {
      // Continue to next round
      setTimeout(() => {
        const pattern = generatePattern();
        setGameState(prev => ({ 
          ...prev, 
          roundsWon: newRoundsWon,
          roundsPlayed: newRoundsPlayed,
          currentPattern: pattern,
          playerInput: [],
          canRepeat: true,
          patternViewCount: 0
        }));
        showPattern(pattern);
      }, 1000);
    }
  };

  // Handle round loss
  const handleRoundLoss = () => {
    const newRoundsPlayed = gameState.roundsPlayed + 1;
    
    if (newRoundsPlayed >= 5) {
      // Game over - red flash
      triggerFailureSequence();
    } else {
      // Reshuffle and continue
      setGameState(prev => ({ 
        ...prev, 
        phase: 'reshuffling',
        roundsPlayed: newRoundsPlayed,
        playerInput: []
      }));
      
      // Visibly reshuffle glyphs
      setTimeout(() => {
        const shuffledPositions = shuffleArray([1, 2, 3, 4, 5, 6]);
        setGameState(prev => ({ 
          ...prev, 
          glyphPositions: shuffledPositions
        }));
        
        // Pause then start new sequence
        setTimeout(() => {
          const pattern = generatePattern();
          setGameState(prev => ({ 
            ...prev, 
            phase: 'gameplay',
            currentPattern: pattern,
            playerInput: [],
            canRepeat: true,
            patternViewCount: 0
          }));
          showPattern(pattern);
        }, 1500);
      }, 500);
    }
  };

  // Trigger failure sequence
  const triggerFailureSequence = () => {
    setFlickerActive(true);
    setTimeout(() => {
      setGameState(prev => ({ ...prev, phase: 'fail' }));
      setFlickerActive(false);
    }, 1500);
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
      patternIndex: 0,
      canRepeat: true,
      patternViewCount: 0,
      glyphPositions: [1, 2, 3, 4, 5, 6]
    });
    setFlickerActive(false);
  };

  const containerStyle = gameState.phase === 'intro' 
    ? {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: '1rem',
        position: 'relative' as const,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    : {
        minHeight: '100vh',
        backgroundImage: 'url("/sidequests/crime/game-board.png")',
        backgroundSize: gameState.phase === 'gameplay' || gameState.phase === 'reshuffling' ? '150%' : 'cover',
        backgroundPosition: gameState.phase === 'gameplay' || gameState.phase === 'reshuffling' ? 'right center' : 'center',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: '1rem',
        position: 'relative' as const,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        animation: gameState.phase === 'gameplay' ? 'zoomFromCenter 1s ease-out' : 'none'
      };

  return (
    <div style={containerStyle}>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes bookReveal {
          0% { opacity: 0; transform: scale(0.8) rotateY(-15deg); }
          100% { opacity: 1; transform: scale(1) rotateY(0deg); }
        }
        
        @keyframes staticFlicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes zoomFromCenter {
          0% { 
            backgroundSize: 100%; 
            backgroundPosition: center; 
          }
          100% { 
            backgroundSize: 150%; 
            backgroundPosition: right center; 
          }
        }
        
        @keyframes glowPulse {
          0%, 100% { 
            boxShadow: 0 0 20px rgba(0,255,255,0.6);
            filter: brightness(1.2);
          }
          50% { 
            boxShadow: 0 0 40px rgba(0,255,255,1);
            filter: brightness(1.5);
          }
        }
        
        @keyframes reshuffleGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5) hue-rotate(45deg); }
        }
      `}</style>

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
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            color: '#ff0000',
            textShadow: '0 0 20px rgba(255,0,0,0.8)',
            margin: 0,
            fontFamily: 'serif'
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
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%'
          }}>
            {/* Control room background - full screen */}
            <img
              src={`/sidequests/crime/control-room-${gameState.sequenceStep}.gif`}
              alt={`Control Room ${gameState.sequenceStep}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            
            {/* Book overlay - 2x bigger, glowing, 2/3 down screen */}
            <div style={{
              position: 'absolute',
              top: '66%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(240px, 40vw, 400px)',
              height: 'clamp(240px, 40vw, 400px)',
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
                  animation: 'bookReveal 2s ease-in-out, glowPulse 2s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 30px rgba(0,255,255,0.8))'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gameplay Phase */}
      {(gameState.phase === 'gameplay' || gameState.phase === 'reshuffling') && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(1rem, 4vw, 2rem)',
          width: '100%',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: '2rem'
        }}>
          {/* Round indicator */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '0.5rem 1.5rem',
            borderRadius: '20px',
            border: '2px solid #00ff00',
            boxShadow: '0 0 15px rgba(0,255,0,0.3)'
          }}>
            <p style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              color: '#00ff00',
              margin: 0,
              textShadow: '0 0 10px #00ff00',
              fontFamily: 'monospace'
            }}>
              Round {gameState.roundsPlayed + 1}/5 - Wins: {gameState.roundsWon}/3
            </p>
          </div>

          {/* Input the sequence instruction */}
          {!gameState.showingPattern && (
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.3rem)',
              color: '#00ff00',
              textAlign: 'center',
              textShadow: '0 0 10px #00ff00',
              margin: 0,
              fontFamily: 'monospace'
            }}>
              INPUT THE SEQUENCE
            </p>
          )}

          {/* Repeat button */}
          {!gameState.showingPattern && gameState.canRepeat && gameState.patternViewCount < 2 && (
            <button
              onClick={repeatPattern}
              style={{
                background: 'linear-gradient(45deg, #ff6600, #ff9900)',
                color: '#ffffff',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255,102,0,0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,102,0,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,102,0,0.4)';
              }}
            >
              REPEAT PATTERN ({2 - gameState.patternViewCount} left)
            </button>
          )}

          {/* Glyph grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1rem, 3vw, 2rem)',
            width: '100%',
            maxWidth: '400px',
            animation: gameState.phase === 'reshuffling' ? 'reshuffleGlow 0.5s ease-in-out infinite' : 'none'
          }}>
            {gameState.glyphPositions.map((glyphNum, index) => {
              const isHighlighted = gameState.showingPattern && 
                gameState.patternIndex > 0 && 
                gameState.currentPattern[gameState.patternIndex - 1] === glyphNum;

              return (
                <button
                  key={index}
                  onClick={() => handleGlyphClick(glyphNum)}
                  disabled={gameState.showingPattern || gameState.phase === 'reshuffling'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: (gameState.showingPattern || gameState.phase === 'reshuffling') ? 'default' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    transform: isHighlighted ? 'scale(1.2)' : 'scale(1)',
                    filter: isHighlighted ? 'brightness(1.5) saturate(1.5)' : 'brightness(1)',
                    boxShadow: isHighlighted ? '0 0 20px rgba(0,255,0,0.8)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!gameState.showingPattern && gameState.phase !== 'reshuffling') {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.filter = 'brightness(1.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!gameState.showingPattern && gameState.phase !== 'reshuffling') {
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

      {/* Win Phase - Green flash */}
      {gameState.phase === 'win' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,255,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '3rem',
            borderRadius: '20px',
            border: '3px solid #00ff00',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(0,255,0,0.8)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              color: '#00ff00',
              textShadow: '0 0 30px #00ff00',
              margin: '0 0 1rem 0'
            }}>
              ACCESS GRANTED
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              color: '#ffffff',
              margin: '0 0 2rem 0'
            }}>
              Security protocols bypassed successfully!
            </p>

            <button
              onClick={resetGame}
              style={{
                background: 'linear-gradient(45deg, #4caf50, #45a049)',
                color: '#ffffff',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76,175,80,0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(76,175,80,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(76,175,80,0.4)';
              }}
            >
              INITIATE NEW SEQUENCE
            </button>
          </div>
        </div>
      )}

      {/* Fail Phase - Red flash */}
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
            borderRadius: '20px',
            border: '3px solid #ff0000',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(255,0,0,0.8)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              color: '#ff0000',
              textShadow: '0 0 30px #ff0000',
              margin: '0 0 1rem 0'
            }}>
              UNAUTHORIZED ACCESS
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              color: '#ffffff',
              margin: '0 0 2rem 0'
            }}>
              Security breach detected. System locked.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(45deg, #ff4444, #cc0000)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '25px',
                  fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255,68,68,0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,68,68,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,68,68,0.4)';
                }}
              >
                TRY AGAIN
              </button>

              <button
                onClick={() => window.location.href = '/game/headquarters'}
                style={{
                  background: 'linear-gradient(45deg, #666666, #444444)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '25px',
                  fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102,102,102,0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,102,102,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,102,102,0.4)';
                }}
              >
                RETURN TO GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}