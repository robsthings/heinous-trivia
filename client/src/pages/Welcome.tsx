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
        <div className="absolute text-sm md:text-base text-white bg-red-700 px-3 py-2 rounded shadow drop-shadow left-1/2 transform -translate-x-1/2 font-semibold whitespace-nowrap mt-[-3rem]">
          {tauntText}
        </div>
        
        {/* Character Image */}
        <img 
          src="/heinous/charming.png" 
          alt="Dr. Heinous" 
          className="max-w-[300px] md:max-w-[520px] w-full h-auto"
        />
      </div>

      {/* Welcome Title - TAILWIND TEST */}
      <h1 className="font-creepster text-center text-5xl md:text-6xl text-orange-500 bg-red-500 p-4 border-4 border-yellow-400">
        WELCOME BACK
      </h1>
      
      {/* Subtext */}
      <p className="text-white text-sm md:text-base">
        Ready for another spine-chilling round of trivia?
      </p>

      {/* Play Again Button */}
      <button
        onClick={handleStartGame}
        className="text-white font-eater text-lg px-6 py-2 rounded shadow transition-colors transform bg-orange-500 hover:bg-green-900 hover:scale-105"
      >
        PLAY AGAIN
      </button>

      {/* Haunt Label */}
      <div className="text-xs text-red-900 drop-shadow-md">
        Haunt: {hauntId}
      </div>
    </div>
  );
}

