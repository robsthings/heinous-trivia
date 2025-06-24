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
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 border-2 border-red-700 rounded-md bg-black/80 text-white px-3 py-1 text-sm drop-shadow-md">
          {tauntText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-700"></div>
        </div>
        
        {/* Character Image */}
        <img 
          src="/heinous/charming.png" 
          alt="Dr. Heinous" 
          className="max-w-[300px] md:max-w-[520px] w-full h-auto"
        />
      </div>

      {/* Welcome Title */}
      <h1 className="font-nosifer text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 leading-tight text-orange-500 animate-pulse">
        WELCOME BACK
      </h1>
      
      {/* Subtext */}
      <p className="text-white text-opacity-80 text-sm sm:text-base md:text-lg">
        Ready for another spine-chilling round of trivia?
      </p>

      {/* Play Again Button */}
      <button
        onClick={handleStartGame}
        className="bg-orange-500 text-white font-eater text-lg px-6 py-2 rounded shadow-lg hover:bg-green-900 transition-transform transform hover:scale-105"
      >
        PLAY AGAIN
      </button>

      {/* Haunt Label */}
      <div className="text-xs font-nosifer text-red-900 drop-shadow mt-4">
        Haunt: {hauntId}
      </div>
    </div>
  );
}

