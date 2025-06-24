import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export function Welcome() {
  const { hauntId } = useParams<{ hauntId: string }>();
  const [, setLocation] = useLocation();
  const [isReturning, setIsReturning] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is returning
    if (hauntId) {
      const hasVisited = localStorage.getItem(`visited_${hauntId}`) === 'true';
      setIsReturning(hasVisited);
    }
  }, [hauntId]);

  const handleStartGame = () => {
    console.log('Play Again clicked, hauntId:', hauntId);
    if (hauntId) {
      // Mark as visited for future welcome screen logic
      const visitKey = `visited_${hauntId}`;
      localStorage.setItem(visitKey, 'true');
      
      // Set session storage to track that user is coming from welcome (corrected key)
      sessionStorage.setItem('fromWelcomeScreen', 'true');
      
      console.log('Navigating to:', `/game/${hauntId}`);
      // Navigate to the game
      window.location.href = `/game/${hauntId}`;
    } else {
      console.error('No hauntId found for navigation');
    }
  };

  // Dynamic taunt logic
  const taunts = isReturning
    ? [
        "Back for more punishment?",
        "Didn't get enough last time?", 
        "You again? Brave soul.",
        "Ready for round two?",
        "Think you can do better this time?"
      ]
    : [
        "Fresh meat!",
        "Welcome to your doom!",
        "A new victim approaches...",
        "Dare ye enter my domain?",
        "Let the horror begin!"
      ];
  
  const tauntText = taunts[Math.floor(Math.random() * taunts.length)];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-white relative"
      style={{
        backgroundImage: "url('/backgrounds/lab-dark-blue.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* Speech Bubble positioned above character */}
      <div className="relative mb-2">
        <div className="bg-crimson text-white rounded px-3 py-1 text-xs border border-red-600 inline-block">
          {tauntText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-crimson"></div>
        </div>
      </div>

      {/* Dr. Heinous Character */}
      <div className="mb-6">
        <img 
          src="/heinous/charming.png" 
          alt="Dr. Heinous" 
          className="w-64 h-auto"
        />
      </div>

      {/* Welcome Heading with exact orange color */}
      <h1 className="font-creepster text-6xl mb-4" style={{ color: '#D2691E' }}>
        WELCOME BACK
      </h1>
      
      {/* Subtext */}
      <p className="text-lg text-gray-300 mb-6 text-center">
        Ready for another spine-chilling round of trivia?
      </p>

      {/* Play Again Button */}
      <button
        onClick={handleStartGame}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded shadow-lg transition-colors"
      >
        PLAY AGAIN
      </button>

      {/* Haunt Footer */}
      <div className="text-sm text-orange-400 mt-4">
        Haunt: <span className="underline">{hauntId}</span>
      </div>
    </div>
  );
}

