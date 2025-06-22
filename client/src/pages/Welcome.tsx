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
  
  // Debug the haunt extraction
  console.log('Welcome component - URL params:', params);
  console.log('Welcome component - currentHauntId:', currentHauntId);

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
        <div className="mb-4 w-full max-w-xs">
          <div 
            className="bg-red-800 border-2 border-red-600 rounded-lg px-4 py-3 relative"
            style={{
              borderRadius: '20px 20px 5px 20px'
            }}
          >
            <p className="text-white text-sm text-center font-medium">
              {isFirstTime ? "Dare ye match wits with ME?!" : "Back for more punishment?"}
            </p>
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #991b1b'
              }}
            />
          </div>
        </div>

        {/* Character Sprite */}
        <div className="mb-8">
          {characterSprite ? (
            <img
              src={isFirstTime ? heinousSprites.talking : heinousSprites.charming}
              alt="Dr. Heinous"
              className="w-32 h-32 object-contain"
            />
          ) : (
            <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">👹</span>
            </div>
          )}
        </div>

        {/* Welcome Title */}
        <h1 
          className="text-2xl font-bold text-center mb-6 px-4"
          style={{
            fontFamily: 'Creepster, cursive',
            color: '#fb923c',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)'
          }}
        >
          {welcomeTitle}
        </h1>
        
        {/* Welcome Message */}
        <p className="text-gray-300 text-center mb-6 px-4 max-w-sm leading-relaxed">
          {welcomeMessage}
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
          className="bg-red-600 text-white px-8 py-3 text-lg font-bold rounded-lg border-2 border-red-500 shadow-lg"
          style={{
            fontFamily: 'Creepster, cursive'
          }}
        >
          {buttonText}
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

