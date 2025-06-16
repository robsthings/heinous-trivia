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

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-2"
      style={{
        backgroundImage: 'url(/sidequests/chupacabra-challenge/challenge-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Vertical Timer - Left side on desktop, top-left on mobile */}
      {timerActive && !gameComplete && !gameFailed && (
        <div className="fixed top-4 left-4 md:top-1/2 md:left-4 md:-translate-y-1/2 z-40">
          <div className="flex flex-col items-center">
            {/* Timer liquid container */}
            <div className="relative w-8 h-40 md:w-12 md:h-56">
              <div 
                className="w-full bg-gradient-to-t from-cyan-400 via-cyan-300 to-cyan-200 transition-all duration-1000 ease-linear shadow-lg shadow-cyan-400/50 border-2 border-cyan-500/30 rounded-full"
                style={{ 
                  height: `${timerPercentage}%`
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 bg-cyan-300/60 animate-pulse rounded-full" />
              </div>
            </div>
            
            {/* Time display */}
            <div className="mt-2 text-cyan-300 font-bold text-xs md:text-sm text-center">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-300 mb-4 drop-shadow-lg" 
            style={{ fontFamily: 'Frijole, cursive' }}
          >
            CHUPACABRA CHALLENGE
          </h1>
          <p className="text-lg sm:text-xl text-red-200 drop-shadow-md">
            Match the cryptid pairs before they escape!
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
            <p className="text-base sm:text-lg text-red-200">
              Matched Pairs: {matchedPairs}/8
            </p>
            <p className="text-base sm:text-lg text-red-200">
              Attempts: {attempts}
            </p>
          </div>
        </div>

        {/* 4x4 Game Grid */}
        {!gameComplete && !gameFailed && (
          <div className="grid grid-cols-4 gap-1 sm:gap-3 max-w-sm sm:max-w-lg md:max-w-2xl mx-auto mb-8 px-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`
                  aspect-square cursor-pointer relative
                  ${!(card.isFlipped || card.isMatched) && !isChecking ? 'hover:scale-105' : ''}
                  transition-transform duration-200 ease-out
                `}
                onClick={() => flipCard(card.id)}
                style={{ perspective: '1000px' }}
              >
                <div 
                  className={`
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
                    className="absolute inset-0 w-full h-full rounded-lg overflow-hidden backface-hidden border-2 border-red-600 hover:border-red-400 transition-colors duration-300"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    <img
                      src="/sidequests/chupacabra-challenge/card-back.png"
                      alt="Card Back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Card Front (face up) */}
                  <div 
                    className={`
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
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Game Complete Overlay */}
        {gameComplete && (
          <div className="text-center mb-8">
            <div className="bg-black/80 border border-red-500 rounded-lg p-6 sm:p-8 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 mb-4">
                You've survived the Chupacabra Challenge!
              </h2>
              <p className="text-lg sm:text-xl text-red-200 mb-4">
                All cryptid pairs matched in {attempts} attempts!
              </p>
              <p className="text-base sm:text-lg text-red-300 mb-6">
                The Chupacabra is impressed by your memory skills.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={initializeCards}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Play Again
                </button>
                <Link href="/game/headquarters">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Return to Main Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Game Failed Overlay */}
        {gameFailed && (
          <div className="text-center mb-8">
            <div className="bg-black/80 border border-red-500 rounded-lg p-6 sm:p-8 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 mb-4">
                You failed the Chupacabra Challenge!
              </h2>
              <p className="text-lg sm:text-xl text-red-200 mb-4">
                Time ran out! You matched {matchedPairs}/8 pairs in {attempts} attempts.
              </p>
              <p className="text-base sm:text-lg text-red-300 mb-6">
                The Chupacabra escapes into the night...
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={initializeCards}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Play Again
                </button>
                <Link href="/game/headquarters">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Return to Main Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Chupacabra Reactions - positioned in corner */}
        {showChupacabraReaction && (
          <div className="fixed bottom-4 right-4 z-50">
            <img
              src={`/chupacabra/chupacabra-${showChupacabraReaction === 'scheming' ? '4' : '2'}.png`}
              alt={`Chupacabra ${showChupacabraReaction}`}
              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain ${
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