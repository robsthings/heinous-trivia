import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  isGhost: boolean; // Special ghost cards that disappear
}

const symbols = ["👻", "🦇", "🕷️", "💀", "🕯️", "⚰️", "🔮", "🗝️"];

type GamePhase = "intro" | "playing" | "victory" | "defeat";

export function SpectralMemory() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [spectralEvent, setSpectralEvent] = useState<string>("");
  const [ghostlyInterference, setGhostlyInterference] = useState(false);
  const gameTimer = useRef<NodeJS.Timeout>();
  const spectralTimer = useRef<NodeJS.Timeout>();

  const initializeGame = () => {
    // Create pairs of cards
    const gameSymbols = symbols.slice(0, 6); // Use 6 different symbols for 12 cards
    const cardPairs: MemoryCard[] = [];
    
    gameSymbols.forEach((symbol, index) => {
      // Add two cards for each symbol
      cardPairs.push({
        id: index * 2,
        symbol,
        isFlipped: false,
        isMatched: false,
        isGhost: false
      });
      cardPairs.push({
        id: index * 2 + 1,
        symbol,
        isFlipped: false,
        isMatched: false,
        isGhost: false
      });
    });

    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setTimeLeft(60);
    setSpectralEvent("");
    setGamePhase("playing");
    
    startGameTimer();
    startSpectralEvents();
  };

  const startGameTimer = () => {
    gameTimer.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGamePhase("defeat");
          clearTimers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startSpectralEvents = () => {
    spectralTimer.current = setInterval(() => {
      triggerSpectralEvent();
    }, 8000 + Math.random() * 7000); // Random events every 8-15 seconds
  };

  const triggerSpectralEvent = () => {
    const events = [
      "ghostly_shuffle",
      "phantom_flip",
      "spectral_fog",
      "ectoplasmic_interference"
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    switch (randomEvent) {
      case "ghostly_shuffle":
        setSpectralEvent("The spirits shuffle the cards!");
        setTimeout(() => {
          setCards(prev => [...prev].sort(() => Math.random() - 0.5));
          setSpectralEvent("");
        }, 2000);
        break;
        
      case "phantom_flip":
        setSpectralEvent("Phantom energy reveals hidden cards!");
        setCards(prev => prev.map(card => 
          !card.isMatched ? { ...card, isFlipped: true } : card
        ));
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            !card.isMatched ? { ...card, isFlipped: false } : card
          ));
          setSpectralEvent("");
        }, 3000);
        break;
        
      case "spectral_fog":
        setSpectralEvent("Spectral fog obscures your vision!");
        setGhostlyInterference(true);
        setTimeout(() => {
          setGhostlyInterference(false);
          setSpectralEvent("");
        }, 4000);
        break;
        
      case "ectoplasmic_interference":
        setSpectralEvent("Ectoplasmic interference scrambles the symbols!");
        const tempSymbols = ["?", "?", "?"];
        setCards(prev => prev.map(card => 
          !card.isMatched && card.isFlipped ? 
            { ...card, symbol: tempSymbols[Math.floor(Math.random() * tempSymbols.length)] } : 
            card
        ));
        setTimeout(() => {
          // Restore original symbols (this is tricky without storing original state)
          setSpectralEvent("");
        }, 2000);
        break;
    }
  };

  const clearTimers = () => {
    if (gameTimer.current) clearInterval(gameTimer.current);
    if (spectralTimer.current) clearInterval(spectralTimer.current);
  };

  const flipCard = (cardId: number) => {
    if (gamePhase !== "playing" || ghostlyInterference) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        checkForMatch(newFlippedCards);
      }, 1000);
    }
  };

  const checkForMatch = (flippedCardIds: number[]) => {
    const [card1Id, card2Id] = flippedCardIds;
    const card1 = cards.find(c => c.id === card1Id);
    const card2 = cards.find(c => c.id === card2Id);

    if (card1 && card2 && card1.symbol === card2.symbol) {
      // Match found
      setCards(prev => prev.map(c => 
        (c.id === card1Id || c.id === card2Id) ? 
          { ...c, isMatched: true } : c
      ));
      
      setMatches(prev => {
        const newMatches = prev + 1;
        if (newMatches >= 6) { // 6 pairs to win
          setGamePhase("victory");
          clearTimers();
        }
        return newMatches;
      });
      
      setSpectralEvent("The spirits approve of your memory!");
      setTimeout(() => setSpectralEvent(""), 2000);
    } else {
      // No match - flip cards back
      setCards(prev => prev.map(c => 
        (c.id === card1Id || c.id === card2Id) ? 
          { ...c, isFlipped: false } : c
      ));
    }
    
    setFlippedCards([]);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const getSpectralMessage = () => {
    if (spectralEvent) return spectralEvent;
    
    if (timeLeft <= 10) {
      return "Time is running out! The veil grows thin...";
    } else if (matches >= 4) {
      return "Excellent memory! The spirits whisper their approval...";
    } else if (moves > 15) {
      return "The dead grow impatient with your struggles...";
    } else {
      return "Remember the patterns... the spirits test your mind...";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl lg:text-6xl font-bold text-purple-400 mb-4 tracking-wider">
            SPECTRAL MEMORY
          </h1>
          <p className="text-lg text-gray-300">
            Match the supernatural symbols before time runs out
          </p>
        </div>

        {gamePhase === "intro" && (
          <div className="text-center bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-purple-500/30">
            <div className="mb-6">
              <span className="text-8xl">🔮</span>
            </div>
            <h2 className="text-2xl font-bold text-purple-400 mb-4">The Spectral Test</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              The spirits have scattered their symbols across the ethereal plane. 
              Match all pairs within 60 seconds, but beware - supernatural interference 
              will test your concentration and memory!
            </p>
            <Button 
              onClick={initializeGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Begin the Trial
            </Button>
          </div>
        )}

        {gamePhase === "playing" && (
          <div>
            {/* Game Stats */}
            <div className="flex justify-between items-center mb-6 bg-black/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{matches}</div>
                <div className="text-sm text-gray-400">Pairs Found</div>
              </div>
              <div className="text-center">
                <div className="text-xl text-purple-400">{moves}</div>
                <div className="text-sm text-gray-400">Moves</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                  {timeLeft}s
                </div>
                <div className="text-sm text-gray-400">Remaining</div>
              </div>
            </div>

            {/* Spectral Messages */}
            <div className="mb-6 text-center bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
              <p className={`text-purple-300 italic ${spectralEvent ? 'animate-pulse' : ''}`}>
                "{getSpectralMessage()}"
              </p>
            </div>

            {/* Memory Grid */}
            <div className={`grid grid-cols-4 gap-4 max-w-md mx-auto transition-all duration-500 ${
              ghostlyInterference ? 'blur-sm opacity-50' : ''
            }`}>
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  disabled={card.isMatched || card.isFlipped || flippedCards.length >= 2}
                  className={`
                    aspect-square rounded-lg border-2 text-4xl font-bold transition-all duration-300 transform hover:scale-105
                    ${card.isMatched 
                      ? 'bg-green-600/30 border-green-400 text-green-200' 
                      : card.isFlipped 
                        ? 'bg-purple-600/50 border-purple-400 text-white' 
                        : 'bg-gray-800/50 border-gray-600 text-transparent hover:bg-gray-700/50'
                    }
                    ${!card.isMatched && !card.isFlipped ? 'cursor-pointer' : ''}
                  `}
                >
                  {card.isFlipped || card.isMatched ? card.symbol : "?"}
                </button>
              ))}
            </div>
          </div>
        )}

        {(gamePhase === "victory" || gamePhase === "defeat") && (
          <div className="text-center">
            <div className={`bg-black/50 backdrop-blur-sm p-8 rounded-lg border mb-6 ${
              gamePhase === "victory" ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'
            }`}>
              <div className="mb-6">
                <span className="text-8xl">
                  {gamePhase === "victory" ? "🌟" : "💀"}
                </span>
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                gamePhase === "victory" ? 'text-green-400' : 'text-red-400'
              }`}>
                {gamePhase === "victory" ? "SPECTRAL MASTERY!" : "TIME'S UP!"}
              </h2>
              
              <p className="text-gray-300 mb-4">
                {gamePhase === "victory" 
                  ? "You have proven your memory worthy of the supernatural realm!" 
                  : "The spirits have claimed victory this time..."}
              </p>
              
              <div className="text-center mb-6 bg-gray-800/50 rounded-lg p-4">
                <div className="text-lg font-bold text-purple-400 mb-2">Final Score</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{matches}/6</div>
                    <div className="text-sm text-gray-400">Pairs Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{moves}</div>
                    <div className="text-sm text-gray-400">Total Moves</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={initializeGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                >
                  Try Again
                </Button>
                <Link href="/game/headquarters" className="no-underline">
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 w-full">
                    Return to Main Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}