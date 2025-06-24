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
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-red-600 rounded-lg px-4 py-3 animate-speech-bubble-in">
          <span className="text-red-400 text-sm sm:text-base font-semibold">
            {tauntText}
          </span>
          {/* Double-layer triangle tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-red-600"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-5 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        
        {/* Character Image */}
        <img 
          src="/heinous/charming.png" 
          alt="Dr. Heinous" 
          className="w-32 sm:w-40 md:w-48 lg:w-56 xl:w-72 h-auto animate-sprite-glitch-in"
          style={{ filter: 'drop-shadow(rgba(255, 107, 53, 0.5) 0px 0px 15px)' }}
        />
      </div>

      {/* Welcome Title */}
      <h1 className="font-nosifer text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-orange-500 animate-pulse">
        Welcome Back
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-400 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8">
        Ready for another spine-chilling round of trivia?
      </p>

      {/* Play Again Button */}
      <button
        onClick={handleStartGame}
        className="font-creepster bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-2 border-red-400 shadow-lg hover:shadow-red-500/50 text-white h-11 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg md:text-xl rounded hover:scale-105 transition-all duration-300"
      >
        PLAY AGAIN
      </button>

      {/* Haunt Label */}
      <div className="text-xs sm:text-sm text-gray-500 mt-4">
        Haunt: <span className="text-orange-400 font-semibold">{hauntId}</span>
      </div>
    </div>
  );
}

