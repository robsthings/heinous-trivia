import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  cardNumber: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: Card[];
  flippedCards: number[];
  matches: number;
  attempts: number;
  timeLeft: number;
  gamePhase: 'ready' | 'playing' | 'victory' | 'defeat';
  failureMessage: string;
}

const CHUPACABRA_REACTIONS = {
  match: [
    "Impossible! You found a pair!",
    "Lucky guess, human...",
    "The cards conspire against me!",
    "Your memory serves you well!"
  ],
  mismatch: [
    "Hah! Wrong again!",
    "Your mind fails you!",
    "I scramble your thoughts!",
    "The cards mock your efforts!"
  ],
  victory: [
    "NOOO! You've contained me!",
    "This cage cannot hold me forever!",
    "You may have won... this time!",
    "Curse your superior memory!"
  ],
  failure: [
    "FREEDOM IS MINE!",
    "Your feeble mind has failed!",
    "I escape to terrorize again!",
    "The cryptid realm awaits!"
  ]
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(): Card[] {
  // Create pairs of cards 1-8
  const cardNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const pairs = [...cardNumbers, ...cardNumbers];
  const shuffledPairs = shuffleArray(pairs);
  
  return shuffledPairs.map((cardNumber, index) => ({
    id: index,
    cardNumber,
    isFlipped: false,
    isMatched: false
  }));
}

function getRandomReaction(category: keyof typeof CHUPACABRA_REACTIONS): string {
  const reactions = CHUPACABRA_REACTIONS[category];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

export function ChupacabraChallenge() {
  const [gameState, setGameState] = useState<GameState>({
    cards: createCards(),
    flippedCards: [],
    matches: 0,
    attempts: 0,
    timeLeft: 90,
    gamePhase: 'playing',
    failureMessage: ''
  });

  const [reactionMessage, setReactionMessage] = useState('');
  const [isPanicMode, setIsPanicMode] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (gameState.gamePhase !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          return {
            ...prev,
            timeLeft: 0,
            gamePhase: 'defeat',
            failureMessage: 'You failed the Chupacabra Challenge!'
          };
        }
        
        // Panic mode at 15 seconds
        if (prev.timeLeft === 15) {
          setIsPanicMode(true);
        }
        
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gamePhase]);

  // Auto-hide reaction messages
  useEffect(() => {
    if (reactionMessage) {
      const timeout = setTimeout(() => setReactionMessage(''), 2000);
      return () => clearTimeout(timeout);
    }
  }, [reactionMessage]);

  const startGame = () => {
    setGameState({
      cards: createCards(),
      flippedCards: [],
      matches: 0,
      attempts: 0,
      timeLeft: 90,
      gamePhase: 'playing',
      failureMessage: ''
    });
    setIsPanicMode(false);
    setReactionMessage('');
  };

  const flipCard = (cardId: number) => {
    if (gameState.gamePhase !== 'playing') return;
    if (gameState.flippedCards.length >= 2) return;
    if (gameState.flippedCards.includes(cardId)) return;
    const targetCard = gameState.cards.find(card => card.id === cardId);
    if (targetCard?.isMatched) return;

    setGameState(prev => {
      const newFlippedCards = [...prev.flippedCards, cardId];
      const newCards = prev.cards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      );

      if (newFlippedCards.length === 2) {
        const [firstCard, secondCard] = newFlippedCards.map(id => newCards.find(card => card.id === id));
        
        setTimeout(() => {
          setGameState(current => {
            if (firstCard.cardNumber === secondCard.cardNumber) {
              // Match found
              const updatedCards = current.cards.map(card =>
                newFlippedCards.includes(card.id)
                  ? { ...card, isMatched: true, isFlipped: true }
                  : card
              );
              
              const newMatches = current.matches + 1;
              setReactionMessage(getRandomReaction('match'));
              
              // Check for victory
              if (newMatches === 8) {
                setReactionMessage(getRandomReaction('victory'));
                return {
                  ...current,
                  cards: updatedCards,
                  flippedCards: [],
                  matches: newMatches,
                  gamePhase: 'victory'
                };
              }
              
              return {
                ...current,
                cards: updatedCards,
                flippedCards: [],
                matches: newMatches
              };
            } else {
              // No match - delay before flipping back
              setReactionMessage(getRandomReaction('mismatch'));
              
              setTimeout(() => {
                setGameState(prevState => ({
                  ...prevState,
                  cards: prevState.cards.map(card =>
                    newFlippedCards.includes(card.id)
                      ? { ...card, isFlipped: false }
                      : card
                  ),
                  flippedCards: []
                }));
              }, 1000);
              
              return {
                ...current,
                attempts: current.attempts + 1
              };
            }
          });
        }, 1000);
      }

      return {
        ...prev,
        cards: newCards,
        flippedCards: newFlippedCards
      };
    });
  };

  const resetGame = () => {
    setGameState({
      cards: createCards(),
      flippedCards: [],
      matches: 0,
      attempts: 0,
      timeLeft: 90,
      gamePhase: 'ready',
      failureMessage: ''
    });
    setIsPanicMode(false);
    setReactionMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/sidequests/chupacabra-challenge/challenge-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3
      }} />

      {/* Panic mode effects */}
      {isPanicMode && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ef4444',
          opacity: 0.2,
          animation: 'pulse 0.5s infinite',
          zIndex: 5
        }} />
      )}

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        paddingTop: 'clamp(1rem, 3vw, 1.5rem)',
        paddingBottom: 'clamp(1rem, 3vw, 1.5rem)'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 3.75rem)',
          fontWeight: 'bold',
          color: '#f87171',
          marginBottom: '0.5rem',
          textShadow: '0 0 20px #ef4444',
          fontFamily: 'Impact, Arial Black, sans-serif'
        }}>
          CHUPACABRA CHALLENGE
        </h1>
        <p style={{
          fontSize: 'clamp(0.9rem, 3vw, 1.125rem)',
          color: '#d1d5db'
        }}>
          Match the cards before time runs out!
        </p>
      </div>

      {/* Game Stats */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem'
      }}>
        <div style={{
          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
          fontWeight: 'bold',
          color: '#4ade80'
        }}>
          Matches: {gameState.matches}/8
        </div>
        <div style={{
          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
          fontWeight: 'bold',
          color: isPanicMode ? '#f87171' : '#22d3ee',
          transition: 'all 0.3s ease',
          animation: isPanicMode ? 'bounce 1s infinite' : 'none'
        }}>
          {isPanicMode && <span style={{ color: '#f87171', fontWeight: 'bold' }}>CONTAINMENT FAILING! </span>}
          Time: {gameState.timeLeft}s
        </div>
        <div style={{
          fontSize: 'clamp(0.9rem, 3vw, 1.125rem)',
          color: '#fbbf24'
        }}>
          Attempts: {gameState.attempts}
        </div>
      </div>

      {/* Chupacabra */}
      <div style={{
        position: 'absolute',
        top: 'clamp(5rem, 15vw, 8rem)',
        right: 'clamp(1rem, 5vw, 2rem)',
        zIndex: 20
      }}>
        <img 
          src="/chupacabra/chupacabra-3.png"
          alt="Chupacabra" 
          style={{
            width: 'clamp(3rem, 8vw, 5rem)',
            height: 'clamp(3rem, 8vw, 5rem)'
          }}
        />
        {reactionMessage && (
          <div style={{
            position: 'absolute',
            left: 'clamp(-12rem, -30vw, -12rem)',
            top: '0.5rem',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#f87171',
            fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #f87171',
            maxWidth: 'clamp(10rem, 25vw, 12rem)',
            wordWrap: 'break-word'
          }}>
            {reactionMessage}
          </div>
        )}
      </div>

      {/* Game Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Ready Screen */}
        {gameState.gamePhase === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 6vw, 1.875rem)',
              color: '#f87171',
              marginBottom: '1.5rem'
            }}>
              The Chupacabra awaits in its containment grid!
            </h2>
            <p style={{
              fontSize: 'clamp(0.9rem, 3vw, 1.125rem)',
              color: '#d1d5db',
              marginBottom: '2rem',
              maxWidth: '600px'
            }}>
              Match all 8 pairs of cryptid cards within 90 seconds to keep it contained.
            </p>
            <button
              onClick={startGame}
              style={{
                padding: 'clamp(0.75rem, 4vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                background: 'linear-gradient(to right, #dc2626, #991b1b)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                borderRadius: '0.5rem',
                border: '2px solid #f87171',
                cursor: 'pointer',
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #b91c1c, #7f1d1d)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #991b1b)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              START CHALLENGE
            </button>
          </div>
        )}

        {/* Game Grid */}
        {gameState.gamePhase === 'playing' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(0.125rem, 0.5vw, 0.25rem)',
            maxWidth: 'clamp(32rem, 90vw, 48rem)',
            margin: '0 auto',
            transition: 'all 0.3s ease',
            animation: isPanicMode ? 'pulse 1s infinite' : 'none'
          }}>
            {gameState.cards.map((card) => (
              <div
                key={card.id}
                style={{
                  width: 'clamp(6.5rem, 19vw, 9.5rem)',
                  height: 'clamp(9.1rem, 26.6vw, 13.3rem)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.6s ease',
                  transform: 'scale(1)',
                  backgroundImage: card.isFlipped || card.isMatched 
                    ? `url(/sidequests/chupacabra-challenge/card-${card.cardNumber}.png)` 
                    : 'url(/sidequests/chupacabra-challenge/card-back.png)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                  boxShadow: card.isMatched ? '0 0 20px rgba(34, 197, 94, 0.5), 0 0 0 4px #22c55e' : 'none',
                  filter: card.isMatched ? 'brightness(1.1) contrast(1.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!card.isMatched && !card.isFlipped) {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!card.isFlipped && !card.isMatched) {
                    e.currentTarget.style.filter = 'none';
                  }
                }}
                onClick={() => flipCard(card.id)}
              >

              </div>
            ))}
          </div>
        )}

        {/* Victory Screen */}
        {gameState.gamePhase === 'victory' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 8vw, 2.5rem)',
              color: '#4ade80',
              marginBottom: '1rem'
            }}>
              CHUPACABRA CONTAINED!
            </h2>
            <p style={{
              fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
              color: '#86efac',
              marginBottom: '0.5rem'
            }}>
              Time Remaining: {gameState.timeLeft} seconds
            </p>
            <p style={{
              fontSize: 'clamp(0.9rem, 3vw, 1.125rem)',
              color: '#fbbf24',
              marginBottom: '1.5rem'
            }}>
              Attempts Made: {gameState.attempts}
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
                  padding: 'clamp(0.75rem, 3vw, 0.75rem) clamp(1.5rem, 3vw, 1.5rem)',
                  background: 'linear-gradient(to right, #059669, #047857)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  border: '2px solid #4ade80',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #047857, #065f46)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                CHALLENGE AGAIN
              </button>
              
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: 'clamp(0.75rem, 3vw, 0.75rem) clamp(1.5rem, 3vw, 1.5rem)',
                  background: 'linear-gradient(to right, #7c3aed, #5b21b6)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  border: '2px solid #a855f7',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #5b21b6, #4c1d95)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #5b21b6)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Return to Game
              </button>
            </div>
          </div>
        )}

        {/* Defeat Screen */}
        {gameState.gamePhase === 'defeat' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 8vw, 2.5rem)',
              color: '#f87171',
              marginBottom: '1rem'
            }}>
              CHUPACABRA ESCAPED!
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              color: '#fca5a5',
              marginBottom: '0.5rem'
            }}>
              {gameState.failureMessage}
            </p>
            <p style={{
              fontSize: 'clamp(0.9rem, 3vw, 1.125rem)',
              color: '#fbbf24',
              marginBottom: '1.5rem'
            }}>
              Matches Found: {gameState.matches}/8
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
                  padding: 'clamp(0.75rem, 3vw, 0.75rem) clamp(1.5rem, 3vw, 1.5rem)',
                  background: 'linear-gradient(to right, #dc2626, #991b1b)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  border: '2px solid #f87171',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #b91c1c, #7f1d1d)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #991b1b)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                TRY AGAIN
              </button>
              
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: 'clamp(0.75rem, 3vw, 0.75rem) clamp(1.5rem, 3vw, 1.5rem)',
                  background: 'linear-gradient(to right, #7c3aed, #5b21b6)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  border: '2px solid #a855f7',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #5b21b6, #4c1d95)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #5b21b6)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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