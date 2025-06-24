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
    if (hauntId) {
      // Mark as visited for future welcome screen logic
      const visitKey = `visited_${hauntId}`;
      localStorage.setItem(visitKey, 'true');
      
      // Set session storage to track that user is coming from welcome
      sessionStorage.setItem('fromWelcomeScreen', 'true');
      
      // Navigate to the game
      window.location.href = `/game/${hauntId}`;
    }
  };

  // Dynamic taunt logic
  const heinousTaunts = isReturning
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
  
  const tauntText = heinousTaunts[Math.floor(Math.random() * heinousTaunts.length)];
  
  // Force refresh trigger

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-4 text-center"
         style={{ backgroundImage: "url('/backgrounds/lab-dark-blue.png')" }}>
      
      {/* Dr. Heinous Character with Speech Bubble */}
      <div className="relative">
        {/* Speech Bubble */}
        <div className="absolute text-xs text-white bg-red-700 px-2 py-1 rounded shadow -translate-y-10 left-1/2 transform -translate-x-1/2">
          {tauntText}
        </div>
        
        {/* Character Image */}
        <img 
          src="/heinous/charming.png" 
          alt="Dr. Heinous" 
          className="max-w-[300px] md:max-w-[520px] w-full h-auto"
        />
      </div>

      {/* Welcome Title */}
      <h1 className="font-creepster text-center text-5xl md:text-6xl mt-6" style={{ color: '#ff5500' }}>
        WELCOME BACK
      </h1>
      
      {/* Subtext */}
      <p className="text-white text-sm md:text-base mt-2">
        Ready for another spine-chilling round of trivia?
      </p>

      {/* Play Again Button */}
      <button
        onClick={handleStartGame}
        className="text-white font-eater text-lg px-6 py-2 rounded shadow mt-4 transition-colors"
        style={{ backgroundColor: '#ff5500' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#013220'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5500'}
      >
        PLAY AGAIN
      </button>

      {/* Haunt Label */}
      <div className="text-xs mt-2" style={{ color: '#5c0a0a', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        Haunt: {hauntId}
      </div>
    </div>
  );
}

