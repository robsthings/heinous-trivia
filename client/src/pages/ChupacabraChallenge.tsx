import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface Card {
  id: number;
  faceValue: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function ChupacabraChallenge() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matched, setMatched] = useState(new Set<number>());
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameFailed, setGameFailed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showChupacabraReaction, setShowChupacabraReaction] = useState<'scheming' | 'taunting' | null>(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize 4x4 grid with 8 pairs (16 total cards)
  const initializeCards = () => {
    const cardPairs: Card[] = [];
    
    // Create 8 pairs (2 of each card type)
    for (let i = 1; i <= 8; i++) {
      cardPairs.push(
        { id: i * 2 - 2, faceValue: i, isFlipped: false, isMatched: false },
        { id: i * 2 - 1, faceValue: i, isFlipped: false, isMatched: false }
      );
    }
    
    // Shuffle cards randomly
    const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatched(new Set());
    setAttempts(0);
    setGameComplete(false);
    setGameFailed(false);
    setIsChecking(false);
    setShowChupacabraReaction(null);
    setTimeLeft(90);
    setTimerActive(true);
  };

  useEffect(() => {
    initializeCards();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || gameComplete || gameFailed) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          setGameFailed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, gameComplete, gameFailed]);

  const flipCard = (cardId: number) => {
    // Prevent flipping if game is over or 3rd card while 2 are revealed
    if (isChecking || flippedCards.length >= 2 || gameComplete || gameFailed) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setAttempts(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.faceValue === secondCard.faceValue) {
        // Match found - show scheming Chupacabra
        setShowChupacabraReaction('scheming');
        
        setTimeout(() => {
          // Mark cards as matched
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstCardId || c.id === secondCardId 
                ? { ...c, isMatched: true } 
                : c
            )
          );
          
          const newMatched = new Set(matched);
          newMatched.add(firstCardId);
          newMatched.add(secondCardId);
          setMatched(newMatched);
          
          setFlippedCards([]);
          setIsChecking(false);
          
          // Check if all 8 pairs are matched
          if (newMatched.size === 16) {
            setGameComplete(true);
            setTimerActive(false);
          }
          
          setShowChupacabraReaction(null);
        }, 1000);
      } else {
        // No match - show taunting Chupacabra
        setShowChupacabraReaction('taunting');
        
        // Auto-hide unmatched cards after 1 second
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstCardId || c.id === secondCardId 
                ? { ...c, isFlipped: false } 
                : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
          setShowChupacabraReaction(null);
        }, 1000);
      }
    }
  };

  const matchedPairs = matched.size / 2;
  const timerPercentage = (timeLeft / 90) * 100;
  const isPanicMode = timeLeft <= 15 && timerActive && !gameComplete && !gameFailed;

  return (
    <div 
        isPanicMode ? 'animate-pulse' : ''
      }`}
      style={{
        backgroundImage: 'url(/sidequests/chupacabra-challenge/challenge-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: isPanicMode ? 'contrast(1.3) saturate(1.4)' : 'none',
        transition: 'filter 0.3s ease-in-out'
      }}
    >
      {/* Dark overlay with panic effect */}
        isPanicMode ? 'bg-red-900/60' : 'bg-black/40'
      } transition-colors duration-300`} />
      
      {/* Panic Mode Red Flash Overlay */}
      {isPanicMode && (
        <div  />
      )}
      
      {/* Vertical Timer - Left side on desktop, top-left on mobile */}
      {timerActive && !gameComplete && !gameFailed && (
        <div >
          <div >
            {/* Timer liquid container */}
            <div >
              <div 
                  isPanicMode 
                    ? 'bg-gradient-to-t from-red-500 via-red-400 to-red-300 shadow-red-500/70 border-red-400/50 animate-pulse' 
                    : 'bg-gradient-to-t from-cyan-400 via-cyan-300 to-cyan-200 shadow-cyan-400/50 border-cyan-500/30'
                }`}
                style={{ 
                  height: `${timerPercentage}%`
                }}
              >
                {/* Inner glow */}
                  isPanicMode 
                    ? 'bg-red-300/70 animate-ping' 
                    : 'bg-cyan-300/60 animate-pulse'
                }`} />
              </div>
            </div>
            
            {/* Time display */}
              isPanicMode 
                ? 'text-red-300 animate-pulse' 
                : 'text-cyan-300'
            }`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}
      
      {/* Panic Mode Warning Text */}
      {isPanicMode && (
        <div >
          <div style={{textAlign: "center"}}>
            <h2 >
              ⚠️ CONTAINMENT FAILING! ⚠️
            </h2>
            <p >
              The Chupacabra is breaking free!
            </p>
          </div>
        </div>
      )}
      
      <div >
        {/* Title */}
        <div  style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}}>
          <h1 
             
            style={{ fontFamily: 'Frijole, cursive' }}
          >
            CHUPACABRA CHALLENGE
          </h1>
          <p >
            Match the cryptid pairs before they escape!
          </p>
          <div >
            <p >
              Matched Pairs: {matchedPairs}/8
            </p>
            <p >
              Attempts: {attempts}
            </p>
          </div>
        </div>

        {/* 4x4 Game Grid */}
        {!gameComplete && !gameFailed && (
            isPanicMode ? 'animate-pulse' : ''
          }`}>
            {cards.map((card) => (
              <div
                key={card.id}
                  aspect-square cursor-pointer relative
                  ${!(card.isFlipped || card.isMatched) && !isChecking ? 'hover:scale-105' : ''}
                  transition-transform duration-200 ease-out
                `}
                onClick={() => flipCard(card.id)}
                style={{ perspective: '1000px' }}
              >
                <div 
                    relative w-full h-full transition-transform duration-600 ease-in-out preserve-3d
                    ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                  `}
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Card Back (face down) */}
                  <div 
                    
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    <img
                      src="/sidequests/chupacabra-challenge/card-back.png"
                      alt="Card Back"
                      
                    />
                  </div>
                  
                  {/* Card Front (face up) */}
                  <div 
                      absolute inset-0 w-full h-full rounded-lg overflow-hidden backface-hidden
                      border-2 transition-all duration-300
                      ${card.isMatched 
                        ? 'border-green-500 shadow-lg shadow-green-500/50' 
                        : isChecking && card.isFlipped && !card.isMatched
                          ? 'border-red-500 shadow-lg shadow-red-500/50'
                          : 'border-blue-400'
                      }
                    `}
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <img
                      src={`/sidequests/chupacabra-challenge/card-${card.faceValue}.png`}
                      alt={`Cryptid ${card.faceValue}`}
                      
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Game Complete Overlay */}
        {gameComplete && (
          <div  style={{textAlign: "center"}}>
            <div >
              <h2 >
                You've survived the Chupacabra Challenge!
              </h2>
              <p >
                All cryptid pairs matched in {attempts} attempts!
              </p>
              <p  style={{marginBottom: "1.5rem"}}>
                The Chupacabra is impressed by your memory skills.
              </p>
              
              <div >
                <button
                  onClick={initializeCards}
                  
                >
                  Play Again
                </button>
                <Link href="/game/headquarters">
                  <button >
                    Return to Main Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Game Failed Overlay */}
        {gameFailed && (
          <div  style={{textAlign: "center"}}>
            <div >
              <h2 >
                You failed the Chupacabra Challenge!
              </h2>
              <p >
                Time ran out! You matched {matchedPairs}/8 pairs in {attempts} attempts.
              </p>
              <p  style={{marginBottom: "1.5rem"}}>
                The Chupacabra escapes into the night...
              </p>
              
              <div >
                <button
                  onClick={initializeCards}
                  
                >
                  Play Again
                </button>
                <Link href="/game/headquarters">
                  <button >
                    Return to Main Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Chupacabra Reactions - positioned in corner */}
        {showChupacabraReaction && (
          <div >
            <img
              src={`/chupacabra/chupacabra-${showChupacabraReaction === 'scheming' ? '4' : '2'}.png`}
              alt={`Chupacabra ${showChupacabraReaction}`}
                showChupacabraReaction === 'scheming' 
                  ? 'animate-pulse' 
                  : 'animate-bounce'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}