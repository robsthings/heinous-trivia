import React, { useState } from 'react';
import { Link } from 'wouter';

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

  const determineWinner = (player: Choice, chupacabra: Choice): 'win' | 'lose' | 'tie' => {
    if (player === chupacabra) return 'tie';
    
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };
    
    return winConditions[player] === chupacabra ? 'win' : 'lose';
  };

  const playRound = (playerChoice: Choice) => {
    const chupacabraChoice = CHOICES[Math.floor(Math.random() * 3)].value;
    const result = determineWinner(playerChoice, chupacabraChoice);
    
    const newKeys = result === 'win' ? gameState.playerKeys + 1 : gameState.playerKeys;
    const newLosses = result === 'lose' ? gameState.playerLosses + 1 : gameState.playerLosses;
    
    setGameState(prev => ({
      ...prev,
      playerChoice,
      chupacabraChoice,
      lastResult: result,
      showResult: true,
      playerKeys: newKeys,
      playerLosses: newLosses,
    }));

    // Check win/lose conditions after a delay
    setTimeout(() => {
      if (newKeys >= 3) {
        // Automatically return to main game after 3rd key
        setTimeout(() => {
          window.location.href = '/game/headquarters';
        }, 2000);
        setGameState(prev => ({ ...prev, phase: 'won' }));
      } else if (newLosses >= 3) {
        setGameState(prev => ({ ...prev, phase: 'lost' }));
      } else {
        setGameState(prev => ({ ...prev, showResult: false }));
      }
    }, 2000);
  };

  const getBackgroundImage = () => {
    switch (gameState.phase) {
      case 'start':
        return '/sidequests/face-the-chupacabra/chupa-behind-bars.png';
      case 'playing':
        return '/sidequests/face-the-chupacabra/chupa-bg.png';
      case 'won':
        return '/sidequests/face-the-chupacabra/chupa-bg.png';
      case 'lost':
        return '/sidequests/face-the-chupacabra/chupa-bg.png'; // Base background for lost phase
      default:
        return '/sidequests/face-the-chupacabra/chupa-bg.png';
    }
  };

  const renderKeys = () => {
    return (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        justifyContent: 'center'
      }}>
        {[1, 2, 3].map((keyNum) => (
          <img
            key={keyNum}
            src={keyNum <= gameState.playerKeys 
              ? `/sidequests/face-the-chupacabra/chupa-key-${keyNum}.png`
              : `/sidequests/face-the-chupacabra/chupa-key.png`
            }
            alt={`Key ${keyNum}`}
            style={{
              width: '1.5rem',
              height: '4rem',
              opacity: keyNum <= gameState.playerKeys ? 1 : 0.3
            }}
          />
        ))}
      </div>
    );
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
      {/* Dark overlay for better text readability */}
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
            
            {/* Collected keys display */}
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">You</h3>
                    <img
                      src={CHOICES.find(c => c.value === gameState.playerChoice)?.image}
                      alt="Your choice"
                      className="w-20 h-20 mx-auto"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">Chupacabra</h3>
                    <img
                      src={CHOICES.find(c => c.value === gameState.chupacabraChoice)?.image}
                      alt="Chupacabra's choice"
                      className="w-20 h-20 mx-auto"
                    />
                  </div>
                </div>
                
                <div className="text-2xl font-bold">
                  {gameState.lastResult === 'win' && (
                    <div className="text-green-400">
                      <div>You Won!</div>
                      <div className=" justify-center mt-2" className="flex-center">
                        <img
                          src={`/sidequests/face-the-chupacabra/chupa-key-${gameState.playerKeys}.png`}
                          alt={`Key ${gameState.playerKeys}`}
                          className="w-12 h-32 animate-bounce"
                        />
                      </div>
                    </div>
                  )}
                  {gameState.lastResult === 'lose' && (
                    <div className="text-red-400">
                      <div>Chupacabra Wins!</div>
                      <img
                        src="/sidequests/face-the-chupacabra/chupa-bite.png"
                        alt="Chupacabra bite"
                        className="w-24 h-24 mx-auto mt-2 animate-bounce"
                      />
                    </div>
                  )}
                  {gameState.lastResult === 'tie' && (
                    <div className="text-yellow-400">It's a Tie!</div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{
              fontSize: '0.875rem',
              color: '#d1d5db'
            }}>
              Wins: {gameState.playerKeys}/3 | Losses: {gameState.playerLosses}/3
            </div>
          </div>
        )}

        {gameState.phase === 'won' && (
          <div className="space-y-6 animate-pulse">
            <h2 className="text-4xl font-bold text-green-400 mb-4">🎉 ESCAPED! 🎉</h2>
            
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
                    animation: 'bounce 1s infinite',
                    animationDelay: `${keyNum * 0.3}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative">
              <img
                src="/sidequests/face-the-chupacabra/chupa-bite.png"
                alt="Victory"
                className="w-32 h-32 mx-auto animate-bounce"
              />
            </div>
            <p className="text-xl text-gray-200 " className="mb-6">
              You collected all 3 keys and escaped! The Chupacabra is defeated!
            </p>
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
              <Link
                href="/game/headquarters"
                className="block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                Return to Main Game
              </Link>
            </div>
          </div>
        )}

        {gameState.phase === 'lost' && (
          <>
            {/* Animated bars dropping overlay - full screen */}
            <div 
              className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat animate-slide-down z-0"
              style={{ 
                backgroundImage: `url(/sidequests/face-the-chupacabra/chupa-bg-bars.png)`,
                animationDelay: '0.5s',
                animationDuration: '1s',
                animationFillMode: 'forwards',
                transform: 'translateY(-100%)'
              }}
            ></div>

            <div className="space-y-6 relative z-10">
              <h2 className="text-4xl font-bold text-red-500 mb-4">💀 GAME OVER 💀</h2>
              <div className="relative">
                <img
                  src="/sidequests/face-the-chupacabra/chupa-bite.png"
                  alt="Chupacabra victory"
                  className="w-32 h-32 mx-auto animate-bounce"
                />
              </div>
              <p style={{
                fontSize: '1.25rem',
                color: '#e5e7eb',
                marginBottom: '1.5rem'
              }}>
                The Chupacabra has defeated you! You remain trapped...
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <button
                  onClick={resetGame}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Try Again
                </button>
                <Link
                  href="/game/headquarters"
                  style={{
                    display: 'block',
                    backgroundColor: '#4b5563',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4b5563';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Return to Main Game
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}