import React, { useState } from 'react';

type Choice = 'rock' | 'paper' | 'scissors';
type GamePhase = 'start' | 'playing' | 'won' | 'lost';

interface GameState {
  phase: GamePhase;
  playerKeys: number;
  playerLosses: number;
  lastResult: 'win' | 'lose' | 'tie' | null;
  playerChoice: Choice | null;
  chupacabraChoice: Choice | null;
  showResult: boolean;
}

const CHOICES: { value: Choice; image: string; label: string }[] = [
  { value: 'rock', image: '/sidequests/face-the-chupacabra/chupa-rock.png', label: 'Rock' },
  { value: 'paper', image: '/sidequests/face-the-chupacabra/chupa-paper.png', label: 'Paper' },
  { value: 'scissors', image: '/sidequests/face-the-chupacabra/chupa-scissors.png', label: 'Scissors' },
];

export function FaceTheChupacabra() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    playerKeys: 0,
    playerLosses: 0,
    lastResult: null,
    playerChoice: null,
    chupacabraChoice: null,
    showResult: false,
  });

  const startGame = () => {
    setGameState({
      phase: 'playing',
      playerKeys: 0,
      playerLosses: 0,
      lastResult: null,
      playerChoice: null,
      chupacabraChoice: null,
      showResult: false,
    });
  };

  const resetGame = () => {
    setGameState({
      phase: 'start',
      playerKeys: 0,
      playerLosses: 0,
      lastResult: null,
      playerChoice: null,
      chupacabraChoice: null,
      showResult: false,
    });
  };

  const makeChoice = (playerChoice: Choice) => {
    const chupacabraChoice = CHOICES[Math.floor(Math.random() * 3)].value;
    
    setGameState(prev => ({
      ...prev,
      playerChoice,
      chupacabraChoice,
      showResult: true,
    }));

    // Determine winner after a brief delay
    setTimeout(() => {
      let result: 'win' | 'lose' | 'tie';
      
      if (playerChoice === chupacabraChoice) {
        result = 'tie';
      } else if (
        (playerChoice === 'rock' && chupacabraChoice === 'scissors') ||
        (playerChoice === 'paper' && chupacabraChoice === 'rock') ||
        (playerChoice === 'scissors' && chupacabraChoice === 'paper')
      ) {
        result = 'win';
      } else {
        result = 'lose';
      }

      setGameState(prev => {
        const newKeys = result === 'win' ? prev.playerKeys + 1 : prev.playerKeys;
        const newLosses = result === 'lose' ? prev.playerLosses + 1 : prev.playerLosses;
        
        // Check win/lose conditions
        let newPhase: GamePhase = 'playing';
        if (newKeys >= 3) {
          newPhase = 'won';
        } else if (newLosses >= 3) {
          newPhase = 'lost';
        }

        return {
          ...prev,
          lastResult: result,
          playerKeys: newKeys,
          playerLosses: newLosses,
          phase: newPhase,
        };
      });

      // Reset choices after showing result
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          playerChoice: null,
          chupacabraChoice: null,
          showResult: false,
        }));
      }, 2000);
    }, 1000);
  };

  const getBackgroundImage = () => {
    return '/sidequests/face-the-chupacabra/chupa-bg.png';
  };

  const renderKeys = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {[1, 2, 3].map((keyNum) => (
          <img
            key={keyNum}
            src={keyNum <= gameState.playerKeys 
              ? `/sidequests/face-the-chupacabra/chupa-key-${keyNum}.png`
              : `/sidequests/face-the-chupacabra/chupa-key-1.png`
            }
            alt={`Key ${keyNum}`}
            style={{
              width: '1.5rem',
              height: '4rem',
              opacity: keyNum <= gameState.playerKeys ? 1 : 0.3,
              filter: keyNum <= gameState.playerKeys ? 'none' : 'grayscale(100%)'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url("${getBackgroundImage()}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      color: '#ffffff',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Dark overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1
      }} />

      {/* Game content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center'
      }}>

        {/* Start Phase */}
        {gameState.phase === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 'bold',
              color: '#ff6b35',
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Creepster, cursive'
            }}>
              FACE THE CHUPACABRA
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              color: '#e5e7eb',
              marginBottom: '2rem',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              The legendary cryptid challenges you to a game of Rock, Paper, Scissors! 
              Collect 3 keys to escape, but beware - 3 losses and you're trapped forever!
            </p>

            <button
              onClick={startGame}
              style={{
                background: 'linear-gradient(45deg, #7f1d1d, #dc2626)',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '1rem 2rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
            >
              ENTER THE ARENA
            </button>
          </div>
        )}

        {/* Playing Phase */}
        {gameState.phase === 'playing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
              fontWeight: 'bold',
              color: '#ff6b35',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Creepster, cursive'
            }}>
              CHUPACABRA DUEL
            </h2>

            {/* Progress Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              maxWidth: '400px',
              marginBottom: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' }}>
                  Keys: {gameState.playerKeys}/3
                </div>
                {renderKeys()}
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ef4444' }}>
                  Losses: {gameState.playerLosses}/3
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  justifyContent: 'center',
                  marginTop: '0.5rem'
                }}>
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      style={{
                        width: '1rem',
                        height: '1rem',
                        borderRadius: '50%',
                        backgroundColor: num <= gameState.playerLosses ? '#ef4444' : '#374151',
                        border: '2px solid #6b7280'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Area */}
            {gameState.showResult && gameState.playerChoice && gameState.chupacabraChoice && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '1rem',
                padding: '2rem',
                margin: '1rem 0',
                border: '2px solid #ff6b35'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  marginBottom: '1rem'
                }}>
                  BATTLE RESULT
                </h3>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                      YOU
                    </div>
                    <img
                      src={CHOICES.find(c => c.value === gameState.playerChoice)?.image}
                      alt={gameState.playerChoice}
                      style={{ width: '4rem', height: '4rem' }}
                    />
                  </div>
                  
                  <div style={{ 
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: gameState.lastResult === 'win' ? '#10b981' : 
                           gameState.lastResult === 'lose' ? '#ef4444' : '#fbbf24'
                  }}>
                    {gameState.lastResult === 'win' ? 'WIN!' : 
                     gameState.lastResult === 'lose' ? 'LOSE!' : 'TIE!'}
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>
                      CHUPACABRA
                    </div>
                    <img
                      src={CHOICES.find(c => c.value === gameState.chupacabraChoice)?.image}
                      alt={gameState.chupacabraChoice}
                      style={{ width: '4rem', height: '4rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Choice Buttons */}
            {!gameState.showResult && (
              <div>
                <p style={{
                  fontSize: '1.125rem',
                  color: '#e5e7eb',
                  marginBottom: '1.5rem'
                }}>
                  Choose your weapon:
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {CHOICES.map((choice) => (
                    <button
                      key={choice.value}
                      onClick={() => makeChoice(choice.value)}
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        border: '2px solid #6b7280',
                        borderRadius: '1rem',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minWidth: '6rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ff6b35';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#6b7280';
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <img
                        src={choice.image}
                        alt={choice.label}
                        style={{ width: '3rem', height: '3rem' }}
                      />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {choice.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Victory Phase */}
        {gameState.phase === 'won' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 'bold',
              color: '#10b981',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Creepster, cursive',
              animation: 'pulse 2s infinite'
            }}>
              🎉 ESCAPED! 🎉
            </h2>
            
            {/* All collected keys display */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {[1, 2, 3].map((keyNum) => (
                <img
                  key={keyNum}
                  src={`/sidequests/face-the-chupacabra/chupa-key-${keyNum}.png`}
                  alt={`Victory Key ${keyNum}`}
                  style={{
                    width: '2.5rem',
                    height: '6.5rem',
                    animation: `bounce 1s infinite ${keyNum * 0.3}s`
                  }}
                />
              ))}
            </div>
            
            <div style={{ position: 'relative' }}>
              <img
                src="/sidequests/face-the-chupacabra/chupa-bite.png"
                alt="Victory"
                style={{
                  width: '8rem',
                  height: '8rem',
                  margin: '0 auto',
                  animation: 'bounce 2s infinite'
                }}
              />
            </div>
            
            <p style={{
              fontSize: '1.25rem',
              color: '#e5e7eb',
              marginBottom: '1.5rem',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              You collected all 3 keys and escaped! The Chupacabra is defeated!
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(45deg, #059669, #10b981)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                PLAY AGAIN
              </button>
              
              <button
                onClick={() => window.location.href = '/game/headquarters'}
                style={{
                  background: 'linear-gradient(45deg, #374151, #6b7280)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                RETURN TO GAME
              </button>
            </div>
          </div>
        )}

        {/* Defeat Phase */}
        {gameState.phase === 'lost' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 'bold',
              color: '#ef4444',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Creepster, cursive'
            }}>
              💀 DEFEATED! 💀
            </h2>
            
            <div style={{ position: 'relative' }}>
              <img
                src="/sidequests/face-the-chupacabra/chupa-bite.png"
                alt="Defeat"
                style={{
                  width: '8rem',
                  height: '8rem',
                  margin: '0 auto',
                  filter: 'sepia(100%) saturate(200%) hue-rotate(320deg)'
                }}
              />
            </div>
            
            <p style={{
              fontSize: '1.25rem',
              color: '#e5e7eb',
              marginBottom: '1.5rem',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              The Chupacabra has bested you! You only collected {gameState.playerKeys} key{gameState.playerKeys !== 1 ? 's' : ''} before falling to the legendary cryptid.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(45deg, #7f1d1d, #dc2626)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                TRY AGAIN
              </button>
              
              <button
                onClick={() => window.location.href = '/game/headquarters'}
                style={{
                  background: 'linear-gradient(45deg, #374151, #6b7280)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                RETURN TO GAME
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-10px); }
            70% { transform: translateY(-5px); }
            90% { transform: translateY(-2px); }
          }
        `
      }} />
    </div>
  );
}