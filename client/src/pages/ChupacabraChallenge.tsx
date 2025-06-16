import { useState, useEffect } from "react";
import { Link } from "wouter";

interface Card {
  id: number;
  faceValue: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export function ChupacabraChallenge() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [chupacabraReaction, setChupacabraReaction] = useState<"match" | "mismatch" | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Initialize and shuffle cards
  const initializeCards = () => {
    const cardPairs: Card[] = [];
    
    // Create pairs of cards (8 different faces, 2 of each)
    for (let i = 1; i <= 8; i++) {
      cardPairs.push(
        { id: i * 2 - 1, faceValue: i, isFlipped: false, isMatched: false },
        { id: i * 2, faceValue: i, isFlipped: false, isMatched: false }
      );
    }
    
    // Shuffle the cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setGameComplete(false);
    setIsChecking(false);
    setChupacabraReaction(null);
    setAttempts(0);
  };

  // Initialize cards on component mount
  useEffect(() => {
    initializeCards();
  }, []);

  // Handle card flip
  const flipCard = (cardId: number) => {
    if (isChecking || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Flip the card
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setAttempts(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);
      
      if (firstCard && secondCard && firstCard.faceValue === secondCard.faceValue) {
        // Match found! Show scheming Chupacabra
        setChupacabraReaction("match");
        
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
          setChupacabraReaction(null);
          
          // Check if game is complete
          if (matchedPairs + 1 === 8) {
            setGameComplete(true);
          }
        }, 1000);
      } else {
        // No match - show taunting Chupacabra then auto-hide unmatched cards after 1 second
        setChupacabraReaction("mismatch");
        
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
          setChupacabraReaction(null);
        }, 1000);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/sidequests/chupacabra-challenge/challenge-bg.png')`
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Chupacabra Reaction Overlays */}
      {chupacabraReaction && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
          <img
            src={chupacabraReaction === "match" 
              ? "/chupacabra/chupacabra-4.png" 
              : "/chupacabra/chupacabra-2.png"
            }
            alt={chupacabraReaction === "match" ? "Scheming Chupacabra" : "Taunting Chupacabra"}
            className={`w-32 h-32 object-contain transition-all duration-300 ${
              chupacabraReaction === "match" 
                ? "animate-pulse drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]" 
                : "animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]"
            }`}
          />
        </div>
      )}
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-red-300 mb-4 drop-shadow-lg">
            Chupacabra Challenge
          </h1>
          <p className="text-xl text-red-200 drop-shadow-md">
            Match the cryptid pairs before they escape!
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <p className="text-lg text-red-200">
              Matched Pairs: {matchedPairs}/8
            </p>
            <p className="text-lg text-red-200">
              Attempts: {attempts}
            </p>
          </div>
        </div>

        {/* Game Grid */}
        {!gameComplete && (
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => flipCard(card.id)}
              >
                <div className="relative w-full h-full preserve-3d group">
                  {/* Card Container with flip animation */}
                  <div 
                    className={`w-full h-full transition-transform duration-700 preserve-3d ${
                      card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Card Back */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                      <img
                        src="/sidequests/chupacabra-challenge/card-back.png"
                        alt="Card Back"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                    </div>
                    
                    {/* Card Front */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                      <img
                        src={`/sidequests/chupacabra-challenge/card-${card.faceValue}.png`}
                        alt={`Cryptid ${card.faceValue}`}
                        className={`w-full h-full object-cover rounded-lg shadow-lg ${
                          card.isMatched ? 'opacity-75 ring-4 ring-green-400' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Game Complete Screen */}
        {gameComplete && (
          <div className="text-center mb-8">
            <div className="bg-black/70 border border-red-500 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-4xl font-bold text-green-400 mb-4">
                You've survived the Chupacabra Challenge!
              </h2>
              <p className="text-xl text-red-200 mb-4">
                All cryptid pairs matched in {attempts} attempts!
              </p>
              <p className="text-lg text-red-300 mb-6">
                The Chupacabra is impressed by your memory skills.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={initializeCards}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Play Again
                </button>
                
                <Link 
                  href="/game/headquarters"
                  className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 no-underline text-center"
                >
                  Return to Main Game
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Instructions (only show during gameplay) */}
        {!gameComplete && (
          <div className="text-center">
            <p className="text-red-200 drop-shadow-md">
              Click cards to flip them. Match pairs to capture the cryptids!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}