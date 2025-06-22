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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Main Content */}
      <div className="max-w-md w-full text-center space-y-6">

        {/* Character Sprite */}
        <div className="mb-6">
          {characterSprite ? (
            <img
              src={isFirstTime ? heinousSprites.talking : heinousSprites.charming}
              alt="Dr. Heinous"
              className="w-32 h-32 mx-auto object-contain"
            />
          ) : (
            <div className="w-32 h-32 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">👹</span>
            </div>
          )}
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">
            {welcomeTitle}
          </h1>
          
          <p className="text-gray-300 text-base leading-relaxed">
            {welcomeMessage}
          </p>

          {isFirstTime && (
            <p className="text-red-400 text-sm">
              ⚡ Warning: This experience may contain jump scares and disturbing content ⚡
            </p>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartGame}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

