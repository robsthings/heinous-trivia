import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  symbol: string;
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

const CRYPTID_SYMBOLS = ['👹', '🦇', '💀', '🕷️', '🐍', '👻', '🔮', '⚡'];

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
  const symbols = CRYPTID_SYMBOLS.slice(0, 8);
  const pairs = [...symbols, ...symbols];
  const shuffledPairs = shuffleArray(pairs);
  
  return shuffledPairs.map((symbol, index) => ({
    id: index,
    symbol,
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
    gamePhase: 'ready',
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
    if (gameState.cards[cardId].isMatched) return;

    setGameState(prev => {
      const newFlippedCards = [...prev.flippedCards, cardId];
      const newCards = prev.cards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      );

      if (newFlippedCards.length === 2) {
        const [firstCard, secondCard] = newFlippedCards.map(id => newCards[id]);
        
        setTimeout(() => {
          setGameState(current => {
            if (firstCard.symbol === secondCard.symbol) {
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
              // No match
              const updatedCards = current.cards.map(card =>
                newFlippedCards.includes(card.id)
                  ? { ...card, isFlipped: false }
                  : card
              );
              
              setReactionMessage(getRandomReaction('mismatch'));
              
              return {
                ...current,
                cards: updatedCards,
                flippedCards: [],
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
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Frijole', cursive"
      }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/backgrounds/lab-dark-blue.png)' }}
      />

      {/* Panic mode effects */}
      {isPanicMode && (
        <div 
          className="absolute inset-0 bg-red-500 opacity-20 animate-pulse z-5"
          style={{ animation: 'pulse 0.5s infinite' }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 text-center py-6">
        <h1 
          className="text-4xl md:text-6xl font-bold text-red-400 mb-2"
          style={{ 
            textShadow: '0 0 20px #ef4444',
            fontFamily: "'Frijole', cursive"
          }}
        >
          CHUPACABRA CHALLENGE
        </h1>
        <p className="text-lg text-gray-300">
          Match the cryptid cards before time runs out!
        </p>
      </div>

      {/* Game Stats */}
      <div className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="text-xl font-bold text-green-400">
          Matches: {gameState.matches}/8
        </div>
        <div 
          className={`text-xl font-bold transition-all duration-300 ${
            isPanicMode ? 'text-red-400 animate-bounce' : 'text-cyan-400'
          }`}
        >
          {isPanicMode && <span className="text-red-400 font-bold">CONTAINMENT FAILING! </span>}
          Time: {gameState.timeLeft}s
        </div>
        <div className="text-lg text-yellow-400">
          Attempts: {gameState.attempts}
        </div>
      </div>

      {/* Chupacabra */}
      <div className="absolute top-20 right-8 z-20">
        <img 
          src="/chupacabra/chupacabra-3.png"
          alt="Chupacabra" 
          className="w-16 h-16 md:w-20 md:h-20"
        />
        {reactionMessage && (
          <div className="absolute -left-48 top-2 bg-black bg-opacity-80 text-red-400 text-sm px-3 py-2 rounded-lg border border-red-400 max-w-48">
            {reactionMessage}
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        
        {/* Ready Screen */}
        {gameState.gamePhase === 'ready' && (
          <div className="text-center">
            <h2 className="text-3xl text-red-400 mb-6">
              The Chupacabra awaits in its containment grid!
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Match all 8 pairs of cryptid symbols within 90 seconds to keep it contained.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xl rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              style={{ 
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
              }}
            >
              START CHALLENGE
            </button>
          </div>
        )}

        {/* Game Grid */}
        {gameState.gamePhase === 'playing' && (
          <div 
            className={`grid grid-cols-4 gap-4 max-w-lg mx-auto transition-all duration-300 ${
              isPanicMode ? 'animate-pulse' : ''
            }`}
          >
            {gameState.cards.map((card) => (
              <div
                key={card.id}
                className={`
                  w-20 h-20 md:w-24 md:h-24 rounded-lg cursor-pointer transition-all duration-600 transform hover:scale-105
                  ${card.isFlipped || card.isMatched 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500 hover:from-gray-600 hover:to-gray-800'
                  }
                  ${card.isMatched ? 'ring-4 ring-green-400 brightness-110 contrast-110' : ''}
                  border-2 flex items-center justify-center text-3xl
                `}
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                  transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  boxShadow: card.isMatched ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none'
                }}
                onClick={() => flipCard(card.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {card.isFlipped || card.isMatched ? card.symbol : '?'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Victory Screen */}
        {gameState.gamePhase === 'victory' && (
          <div className="text-center">
            <h2 className="text-4xl text-green-400 mb-4">CHUPACABRA CONTAINED!</h2>
            <p className="text-2xl text-green-300 mb-2">
              Time Remaining: {gameState.timeLeft} seconds
            </p>
            <p className="text-lg text-yellow-400 mb-6">
              Attempts Made: {gameState.attempts}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg border-2 border-green-400 hover:from-green-500 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                CHALLENGE AGAIN
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Return to Game
              </button>
            </div>
          </div>
        )}

        {/* Defeat Screen */}
        {gameState.gamePhase === 'defeat' && (
          <div className="text-center">
            <h2 className="text-4xl text-red-400 mb-4">CHUPACABRA ESCAPED!</h2>
            <p className="text-xl text-red-300 mb-2">
              {gameState.failureMessage}
            </p>
            <p className="text-lg text-yellow-400 mb-6">
              Matches Found: {gameState.matches}/8
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                TRY AGAIN
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
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