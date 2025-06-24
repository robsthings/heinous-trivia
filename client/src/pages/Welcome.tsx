import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { heinousSprites } from '@/lib/characterLoader';
import { Button } from '@/components/ui/button';
import { SpeechBubble } from '@/components/SpeechBubble';

export function Welcome() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/welcome/:hauntId');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showGlitchEffect, setShowGlitchEffect] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const currentHauntId = params?.hauntId || 'headquarters';
  
  // Haunt extraction - debug logging removed for production

  // Define dialogue messages for different user types
  const firstTimeMessages = [
    "Initializing Evil Protocols…",
    "Dare ye match wits with ME?!",
    "Prepare for HEINOUS challenges!"
  ];

  const returningUserMessages = [
    "Back for more punishment?"
  ];

  useEffect(() => {
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('hasSeenHeinousIntro');
    const isFirstVisit = !hasSeenIntro;
    
    setIsFirstTime(isFirstVisit);

    // Trigger glitch effect for first-time users
    if (isFirstVisit) {
      const glitchTimer = setTimeout(() => {
        setShowGlitchEffect(true);
      }, 1000);

      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);

      return () => {
        clearTimeout(glitchTimer);
        clearTimeout(animationTimer);
      };
    } else {
      // Shorter animation for returning users
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500);

      return () => clearTimeout(animationTimer);
    }
  }, []);

  const handleStartGame = () => {
    // Mark intro as seen
    localStorage.setItem('hasSeenHeinousIntro', 'true');
    
    // Add a flag to indicate we're coming from welcome screen
    sessionStorage.setItem('fromWelcomeScreen', 'true');
    
    // Navigate to game
    navigate(`/game/${currentHauntId}`);
  };

  const characterSprite = isFirstTime ? heinousSprites.talking : heinousSprites.charming;
  const buttonText = isFirstTime ? 'Start Game' : 'Play Again';
  const welcomeTitle = isFirstTime ? 'Welcome to Heinous Trivia' : 'Welcome Back';
  const welcomeMessage = isFirstTime 
    ? 'Prepare yourself for a terrifying journey through the darkest corners of trivia knowledge...'
    : 'Ready for another spine-chilling round of trivia?';

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        background: `
          linear-gradient(rgba(0, 0, 0, 0.7), rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.9)),
          url(/backgrounds/lab-dark-blue.png)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll'
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* Speech Bubble */}
        <div className="mb-4 w-full max-w-xs sm:max-w-sm">
          <div 
            className="bg-crimson border-2 border-blood rounded-lg px-3 py-2 sm:px-4 sm:py-3 relative animate-pulse-glow"
            style={{
              borderRadius: '15px 15px 5px 15px',
              background: '#DC143C',
              boxShadow: '0 3px 10px rgba(220, 20, 60, 0.3)'
            }}
          >
            <p className="text-white text-xs sm:text-sm text-center font-medium">
              Back for more punishment?!
            </p>
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #DC143C'
              }}
            />
          </div>
        </div>

        {/* Character Sprite */}
        <div className="mb-4">
          {characterSprite ? (
            <img
              src={isFirstTime ? heinousSprites.talking : heinousSprites.charming}
              alt="Dr. Heinous"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain mx-auto"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl sm:text-3xl md:text-4xl">👹</span>
            </div>
          )}
        </div>

        {/* Welcome Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-nosifer text-center mb-4 px-4 animate-pulse-glow"
            style={{
              color: '#d86b29',
              textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(216, 107, 41, 0.4)',
              fontSize: 'clamp(1.5rem, 6vw, 2.5rem)'
            }}>
          WELCOME BACK
        </h1>
        
        {/* Welcome Message */}
        <p className="text-sm sm:text-base text-center mb-6 px-4 max-w-sm leading-relaxed"
           style={{ color: '#cccccc' }}>
          Ready for another spine-chilling round of trivia?
        </p>

        {/* Warning for first-time users */}
        {isFirstTime && (
          <p className="text-red-400 text-sm text-center mb-6 px-4">
            ⚡ Warning: This experience may contain jump scares and disturbing content ⚡
          </p>
        )}

        {/* Play Button */}
        <button
          onClick={handleStartGame}
          className="bg-gradient-to-r from-blood to-crimson hover:from-flame hover:to-blood text-white px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-bold rounded-lg border-2 border-crimson shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-crimson/50 animate-pulse-glow"
          style={{
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            boxShadow: '0 8px 20px rgba(220, 20, 60, 0.3), 0 0 15px rgba(220, 20, 60, 0.2)'
          }}
        >
          PLAY AGAIN
        </button>

        {/* Haunt Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Haunt: <span className="text-orange-400 font-semibold">{currentHauntId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

