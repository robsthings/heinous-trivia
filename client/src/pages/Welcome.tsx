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
      className="min-h-screen flex items-center justify-center text-white relative overflow-hidden"
      style={{
        backgroundImage: "url('/backgrounds/lab-dark-blue.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        
        {/* Speech Bubble */}
        <div className="mb-2">
          <div className="bg-poison text-white rounded-full px-4 py-1 text-sm font-bold drop-shadow mb-2 inline-block relative">
            {tauntText}
            {/* Speech bubble pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-poison"></div>
          </div>
        </div>

        {/* Dr. Heinous Character */}
        <div className="mb-6 flex justify-center">
          <img 
            src="/heinous/charming.png" 
            alt="Dr. Heinous" 
            className="w-48 md:w-64 lg:w-72 drop-shadow-xl"
            style={{ 
              imageRendering: 'pixelated',
              width: '192px',
              maxWidth: '288px'
            }}
          />
        </div>

        {/* Welcome Heading */}
        <h1 className="text-4xl md:text-5xl font-creepster text-flame text-center drop-shadow-glow mb-4">
          WELCOME BACK
        </h1>
        
        {/* Subtext */}
        <p className="text-lg text-ghost mt-4 mb-6 text-center">
          Ready for another spine-chilling round of trivia?
        </p>

        {/* Play Again Button */}
        <button
          onClick={handleStartGame}
          className="bg-blood hover:bg-crimson text-white font-bold px-6 py-3 rounded-md shadow-md transition hover:scale-105"
        >
          PLAY AGAIN
        </button>

        {/* Dynamic Haunt Footer */}
        <div className="text-sm text-flame text-center mt-6">
          Haunt: {hauntId}
        </div>
      </div>
    </div>
  );
}

