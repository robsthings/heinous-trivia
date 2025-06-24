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
        <div className="mb-2 w-full max-w-xs">
          <div 
            className="bg-crimson border border-blood rounded px-2 py-1 relative animate-pulse-glow"
            style={{
              borderRadius: '8px 8px 2px 8px',
              background: '#DC143C',
              boxShadow: '0 1px 4px rgba(220, 20, 60, 0.2)'
            }}
          >
            <p className="text-white text-center font-medium"
               style={{ fontSize: '0.625rem' }}>
              Back for more punishment?!
            </p>
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #DC143C'
              }}
            />
          </div>
        </div>

        {/* Character Sprite */}
        <div className="mb-3 flex justify-center">
          <div 
            className="overflow-hidden flex items-center justify-center"
            style={{ 
              width: '48px', 
              height: '48px',
              maxWidth: '48px',
              maxHeight: '48px'
            }}
          >
            {characterSprite ? (
              <img
                src={isFirstTime ? heinousSprites.talking : heinousSprites.charming}
                alt="Dr. Heinous"
                className="object-contain"
                style={{ 
                  width: '100%',
                  height: '100%',
                  maxWidth: '48px',
                  maxHeight: '48px'
                }}
              />
            ) : (
              <span className="text-lg">👹</span>
            )}
          </div>
        </div>

        {/* Welcome Title */}
        <h1 className="text-lg font-nosifer text-center mb-2 px-4 animate-pulse-glow"
            style={{
              color: '#d86b29',
              textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(216, 107, 41, 0.4)',
              fontSize: '1.125rem'
            }}>
          WELCOME BACK
        </h1>
        
        {/* Welcome Message */}
        <p className="text-xs text-center mb-3 px-4 max-w-xs leading-relaxed"
           style={{ color: '#cccccc', fontSize: '0.75rem' }}>
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
          className="bg-gradient-to-r from-blood to-crimson hover:from-flame hover:to-blood text-white px-3 py-1 text-xs font-bold rounded border border-crimson shadow transform transition-all duration-300 hover:scale-105 hover:shadow-crimson/50 animate-pulse-glow"
          style={{
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            fontSize: '0.75rem',
            boxShadow: '0 2px 8px rgba(220, 20, 60, 0.2)'
          }}
        >
          PLAY AGAIN
        </button>

        {/* Haunt Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-orange-500 underline">
            Haunt: {currentHauntId}
          </p>
        </div>
      </div>
    </div>
  );
}

