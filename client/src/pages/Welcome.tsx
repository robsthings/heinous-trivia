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
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/backgrounds/lab-dark-blue.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-gray-900/70 to-black/80" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-center">
        
        {/* Character Sprite with Speech Bubble */}
        <div className="mb-8 relative">
          {/* Speech Bubble */}
          <div className="mb-6">
            <SpeechBubble 
              messages={isFirstTime ? firstTimeMessages : returningUserMessages}
              isVisible={true}
              className="mb-4"
            />
          </div>

          {/* Character Sprite */}
          {characterSprite ? (
            <img
              src={isFirstTime ? heinousSprites.talking : heinousSprites.charming}
              alt="Dr. Heinous"
              className="w-40 h-40 md:w-48 md:h-48 object-contain mx-auto drop-shadow-2xl"
            />
          ) : (
            <div className="w-40 h-40 md:w-48 md:h-48 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-5xl">👹</span>
            </div>
          )}
        </div>

        {/* Welcome Text */}
        <div className="max-w-sm mx-auto space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-400" style={{
            fontFamily: 'Creepster, cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            {welcomeTitle}
          </h1>
          
          <p className="text-gray-300 text-lg leading-relaxed">
            {welcomeMessage}
          </p>

          {isFirstTime && (
            <p className="text-red-400 text-sm animate-pulse">
              ⚡ Warning: This experience may contain jump scares and disturbing content ⚡
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartGame}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-xl font-bold rounded-lg border-2 border-red-500 transition-all duration-300 transform hover:scale-105 shadow-xl"
          style={{
            fontFamily: 'Creepster, cursive',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {buttonText}
        </button>

        {/* Haunt Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Haunt: <span className="text-orange-400 font-semibold">{currentHauntId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

