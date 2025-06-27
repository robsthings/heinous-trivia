import { useState } from 'react';

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
  { value: 'scissors', image: '/sidequests/face-the-chupacabra/chupa-scissors.png', label: 'Scissors' }
];

export default function FaceTheChupacabra() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    playerKeys: 0,
    playerLosses: 0,
    lastResult: null,
    playerChoice: null,
    chupacabraChoice: null,
    showResult: false
  });

  const determineWinner = (player: Choice, chupacabra: Choice): 'win' | 'lose' | 'tie' => {
    if (player === chupacabra) return 'tie';
    if (
      (player === 'rock' && chupacabra === 'scissors') ||
      (player === 'paper' && chupacabra === 'rock') ||
      (player === 'scissors' && chupacabra === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const playRound = (playerChoice: Choice) => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const chupacabraChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = determineWinner(playerChoice, chupacabraChoice);

    setGameState(prev => ({
      ...prev,
      playerChoice,
      chupacabraChoice,
      lastResult: result,
      showResult: true,
      playerKeys: result === 'win' ? prev.playerKeys + 1 : prev.playerKeys,
      playerLosses: result === 'lose' ? prev.playerLosses + 1 : prev.playerLosses
    }));

    setTimeout(() => {
      setGameState(prev => {
        if (prev.playerKeys >= 3) {
          return { ...prev, phase: 'won' };
        } else if (prev.playerLosses >= 3) {
          return { ...prev, phase: 'lost' };
        }
        return { ...prev, showResult: false };
      });
    }, 2000);
  };

  const startGame = () => {
    setGameState({
      phase: 'playing',
      playerKeys: 0,
      playerLosses: 0,
      lastResult: null,
      playerChoice: null,
      chupacabraChoice: null,
      showResult: false
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
      showResult: false
    });
  };

  const getBackgroundImage = () => {
    if (gameState.phase === 'lost') {
      return '/sidequests/face-the-chupacabra/chupa-bg.png';
    }
    return '/sidequests/face-the-chupacabra/chupa-bg.png';
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        color: 'white',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.4)'
      }}></div>
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '32rem',
        width: '100%',
        textAlign: 'center'
      }}>
        {gameState.phase === 'start' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            paddingTop: '2rem',
            paddingBottom: '5rem',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '1rem',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
                fontFamily: 'Creepster, cursive'
              }}>
                Face the Chupacabra
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: '#e5e7eb'
              }}>
                Win 3 rounds of rock-paper-scissors to escape!
              </p>
            </div>
            <button
              onClick={startGame}
              style={{
                background: '#dc2626',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.25rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Start Game
            </button>
          </div>
        )}

        {gameState.phase === 'playing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 6vw, 2rem)',
              fontWeight: 'bold',
              color: '#ef4444',
              marginBottom: '1rem'
            }}>Choose Your Weapon!</h2>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              {[1, 2, 3].map((keyNum) => (
                <div key={keyNum} style={{ position: 'relative' }}>
                  {keyNum <= gameState.playerKeys ? (
                    <img
                      src={`/sidequests/face-the-chupacabra/chupa-key-${keyNum}.png`}
                      alt={`Collected Key ${keyNum}`}
                      style={{
                        width: '2rem',
                        height: '5rem',
                        animation: 'bounce 1s infinite',
                        animationDelay: `${keyNum * 0.2}s`
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '2rem',
                      height: '5rem',
                      border: '2px dashed #4b5563',
                      borderRadius: '0.25rem',
                      opacity: 0.3
                    }}></div>
                  )}
                </div>
              ))}
            </div>
            
            {!gameState.showResult && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem'
              }}>
                {CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    onClick={() => playRound(choice.value)}
                    style={{
                      position: 'relative',
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s ease',
                      border: '2px solid #4b5563',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.8)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = '#4b5563';
                    }}
                    title={choice.value === 'scissors' ? 'Staby Staby' : choice.label}
                  >
                    <img
                      src={choice.image}
                      alt={choice.label}
                      style={{
                        width: '4rem',
                        height: '4rem',
                        margin: '0 auto 0.5rem auto'
                      }}
                    />
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>{choice.label}</div>
                    
                    {choice.value === 'scissors' && (
                      <div style={{
                        position: 'absolute',
                        top: '-2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: '#f87171',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        whiteSpace: 'nowrap'
                      }}>
                        Staby Staby
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {gameState.showResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '2rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>You</h3>
                    <img
                      src={CHOICES.find(c => c.value === gameState.playerChoice)?.image}
                      alt="Your choice"
                      style={{
                        width: '5rem',
                        height: '5rem',
                        margin: '0 auto'
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>Chupacabra</h3>
                    <img
                      src={CHOICES.find(c => c.value === gameState.chupacabraChoice)?.image}
                      alt="Chupacabra's choice"
                      style={{
                        width: '5rem',
                        height: '5rem',
                        margin: '0 auto'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {gameState.lastResult === 'win' && (
                    <div style={{ color: '#4ade80' }}>
                      <div>You Won!</div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '0.5rem'
                      }}>
                        <img
                          src={`/sidequests/face-the-chupacabra/chupa-key-${gameState.playerKeys}.png`}
                          alt={`Key ${gameState.playerKeys}`}
                          style={{
                            width: '3rem',
                            height: '8rem',
                            animation: 'bounce 1s infinite'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {gameState.lastResult === 'lose' && (
                    <div style={{ color: '#f87171' }}>
                      <div>You Lost!</div>
                      <img
                        src="/sidequests/face-the-chupacabra/chupa-bite.png"
                        alt="Chupacabra bite"
                        style={{
                          width: '6rem',
                          height: '6rem',
                          margin: '0.5rem auto 0 auto',
                          animation: 'bounce 1s infinite'
                        }}
                      />
                    </div>
                  )}
                  {gameState.lastResult === 'tie' && (
                    <div style={{ color: '#facc15' }}>It's a Tie!</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {gameState.phase === 'won' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pulse 2s infinite' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 'bold',
              color: '#4ade80',
              marginBottom: '1rem'
            }}>🎉 ESCAPED! 🎉</h2>
            
            <div style={{ position: 'relative' }}>
              <img
                src="/public/heinous/charming.png"
                alt="Dr. Heinous"
                style={{
                  width: '8rem',
                  height: '8rem',
                  margin: '0 auto',
                  animation: 'bounce 1s infinite'
                }}
              />
            </div>
            
            <p style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              color: '#e5e7eb',
              marginBottom: '1.5rem'
            }}>
              You escaped the Chupacabra's lair with all three keys!
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={resetGame}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#15803d';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Play Again
              </button>
              <a
                href="/game"
                style={{
                  display: 'block',
                  background: '#4b5563',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#374151';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4b5563';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Return to Game
              </a>
            </div>
          </div>
        )}

        {gameState.phase === 'lost' && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: '0',
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/sidequests/face-the-chupacabra/chupa-bg-bars.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                animation: 'slideDown 1.5s ease-out',
                zIndex: 0
              }}
            ></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '1rem'
              }}>💀 GAME OVER 💀</h2>
              <div style={{ position: 'relative' }}>
                <img
                  src="/public/heinous/charming.png"
                  alt="Dr. Heinous"
                  style={{
                    width: '8rem',
                    height: '8rem',
                    margin: '0 auto',
                    animation: 'bounce 1s infinite'
                  }}
                />
              </div>
              
              <p style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: '#e5e7eb',
                marginBottom: '1.5rem'
              }}>
                The Chupacabra has trapped you in its lair forever!
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={resetGame}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    zIndex: 99999
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b91c1c';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Try Again
                </button>
                <a
                  href="/game"
                  style={{
                    display: 'block',
                    background: '#4b5563',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    zIndex: 99999
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#374151';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#4b5563';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Return to Game
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0,-30px,0);
            }
            70% {
              transform: translate3d(0,-15px,0);
            }
            90% {
              transform: translate3d(0,-4px,0);
            }
          }
          
          @keyframes slideDown {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `
      }} />
    </div>
  );
}