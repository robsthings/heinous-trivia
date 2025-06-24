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
      className="bg-cover bg-center min-h-screen flex flex-col justify-center items-center text-center px-4"
      style={{
        backgroundImage: "url('/backgrounds/lab-dark-blue.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* Dr. Heinous Character with Speech Bubble */}
      <div className="relative mt-4">
        {/* Speech Bubble */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-poison text-white text-sm px-4 py-1 rounded-full shadow-md whitespace-nowrap">
          {tauntText}
        </div>
        
        {/* Character Image */}
        <img 
          src="/heinous/charming.png" 
          alt="Dr. Heinous" 
          className="w-48 md:w-56 lg:w-64 relative"
        />
      </div>

      {/* Welcome Title */}
      <h1 className="text-flame font-creepster text-5xl md:text-6xl drop-shadow-glow animate-pulse-glow mt-6">
        WELCOME BACK
      </h1>
      
      {/* Subtitle */}
      <p className="text-lg text-ghost mt-2">
        Ready for another spine-chilling round of trivia?
      </p>
      
      {/* Play Button */}
      <button 
        onClick={handleStartGame}
        className="bg-blood text-white text-sm px-6 py-2 rounded shadow hover:bg-crimson transition mt-4"
      >
        PLAY AGAIN
      </button>
      
      {/* Haunt Display */}
      {hauntId && (
        <p className="text-sm text-ghost mt-2">
          Haunt: <span className="text-flame font-semibold">{hauntId}</span>
        </p>
      )}
    </div>
  );
}

