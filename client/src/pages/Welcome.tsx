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
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-4 text-center gap-4"
         style={{ backgroundImage: "url('/backgrounds/lab-dark-blue.png')" }}>
      
      {/* Dr. Heinous Character with Speech Bubble */}
      <div className="relative">
        {/* Speech Bubble */}
        <div className="absolute text-sm md:text-base text-white px-3 py-2 rounded shadow left-1/2 transform -translate-x-1/2 font-semibold whitespace-nowrap" 
             style={{ 
               backgroundColor: '#b91c1c', 
               top: '-3rem',
               textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
             }}>
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
      <h1 className="text-center text-5xl md:text-6xl" style={{ fontFamily: 'Creepster, cursive', color: '#ff6600' }}>
        WELCOME BACK
      </h1>
      
      {/* Subtext */}
      <p className="text-white text-sm md:text-base">
        Ready for another spine-chilling round of trivia?
      </p>

      {/* Play Again Button */}
      <button
        onClick={handleStartGame}
        className="text-white text-lg px-6 py-2 rounded shadow transition-all transform hover:scale-105"
        style={{ 
          fontFamily: 'Eater, cursive', 
          backgroundColor: '#ff6600',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6600'}
      >
        PLAY AGAIN
      </button>

      {/* Haunt Label */}
      <div className="text-xs" style={{ color: '#7f1d1d', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        Haunt: {hauntId}
      </div>
    </div>
  );
}

