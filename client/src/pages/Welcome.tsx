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
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: 'url(/backgrounds/lab-dark-blue.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark gradient overlay for contrast - responsive */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-black/60 via-gray-900/70 to-black/80 z-0" />

      {/* Lightning/Glitch Background Effects for First-Time Users - responsive */}
      {isFirstTime && (
        <>
          {/* Lightning effect overlay */}
          <div 
            className={`absolute inset-0 w-full h-full z-5 transition-opacity duration-300 ${
              showGlitchEffect ? 'opacity-30 animate-lightning-flash' : 'opacity-0'
            }`}
            style={{
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(30, 144, 255, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 30%, rgba(139, 0, 0, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 40% 80%, rgba(255, 107, 53, 0.2) 0%, transparent 50%)
              `
            }}
          />
          
          {/* Glitch lines overlay */}
          <div 
            className={`absolute inset-0 w-full h-full z-10 pointer-events-none transition-opacity duration-500 ${
              showGlitchEffect ? 'opacity-20 animate-glitch-lines' : 'opacity-0'
            }`}
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(139, 0, 0, 0.1) 2px,
                  rgba(139, 0, 0, 0.1) 4px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 1px,
                  rgba(30, 144, 255, 0.05) 1px,
                  rgba(30, 144, 255, 0.05) 3px
                )
              `
            }}
          />
        </>
      )}

      {/* Main Content - responsive container */}
      <div className="relative z-20 min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        
        {/* Character Sprite with Speech Bubble - responsive sizing */}
        <div className="mb-6 sm:mb-8 flex-shrink-0 relative flex flex-col items-center">
          
          {/* Speech Bubble - positioned above sprite */}
          <div className="mb-4 sm:mb-6">
            <SpeechBubble 
              messages={isFirstTime ? firstTimeMessages : returningUserMessages}
              isVisible={true}
              className="animate-speech-bubble-in"
            />
          </div>

          {/* Character Sprite */}
          {characterSprite ? (
            <img
              src={isFirstTime ? heinousSprites.talking : heinousSprites.charming}
              alt="Dr. Heinous"
              className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain drop-shadow-2xl max-w-full ${
                isFirstTime ? 'animate-sprite-slide-bounce-in' : 'animate-sprite-glitch-in'
              }`}
              style={{
                filter: isFirstTime && showGlitchEffect ? 
                  'drop-shadow(0 0 20px rgba(139, 0, 0, 0.7))' : 
                  'drop-shadow(0 0 15px rgba(255, 107, 53, 0.5))',
                animationDelay: isFirstTime ? '0.5s' : '0.2s'
              }}
              onAnimationEnd={(e) => {
                // Add idle twitch animation after slide-bounce-in completes
                if (isFirstTime && e.animationName === 'sprite-slide-bounce-in') {
                  e.currentTarget.classList.add('animate-sprite-idle-twitch');
                }
              }}
            />
          ) : (
            // Fallback if sprite doesn't load
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-72 xl:h-72 bg-gradient-to-br from-red-900 to-purple-900 rounded-full flex items-center justify-center max-w-full">
              <span className="text-4xl sm:text-5xl lg:text-6xl">👹</span>
            </div>
          )}
        </div>

        {/* Welcome Text - responsive typography */}
        <div className="text-center max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto mb-6 sm:mb-8 px-2">
          <h1 className={`font-nosifer text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 leading-tight ${
            isFirstTime ? 'text-red-500 animate-fade-in' : 'text-orange-500 animate-pulse'
          }`}
          style={{
            animationDelay: isFirstTime ? '1s' : '0s',
            animationDuration: isFirstTime ? '0.8s' : '3s',
            animationFillMode: 'forwards',
            opacity: isFirstTime ? 0 : 1
          }}>
            {welcomeTitle}
          </h1>
          
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 leading-relaxed ${
            isFirstTime ? 'text-gray-300 animate-fade-in' : 'text-gray-400'
          } ${
            !isFirstTime && !isAnimating ? 'translate-y-0 opacity-100 transition-all duration-1000' : 
            !isFirstTime && isAnimating ? 'translate-y-10 opacity-0 transition-all duration-1000' : ''
          }`}
          style={isFirstTime ? {
            animationDelay: '1.8s',
            animationDuration: '0.8s',
            animationFillMode: 'forwards',
            opacity: 0
          } : {}}>
            {welcomeMessage}
          </p>

          {isFirstTime && (
            <div className="text-xs sm:text-sm text-red-400 mb-4 sm:mb-6 animate-fade-in"
            style={{
              animationDelay: '2.5s',
              animationDuration: '0.8s',
              animationFillMode: 'forwards',
              opacity: 0
            }}>
              <p className="animate-pulse">
                ⚡ Warning: This experience may contain jump scares and disturbing content ⚡
              </p>
            </div>
          )}
        </div>

        {/* Action Button - responsive sizing */}
        <div className={`flex justify-center w-full ${
          isFirstTime ? 'animate-fade-in' : 
          isAnimating ? 'translate-y-10 opacity-0 transition-all duration-1000' : 'translate-y-0 opacity-100 transition-all duration-1000'
        }`}
        style={isFirstTime ? {
          animationDelay: '3.2s',
          animationDuration: '0.8s',
          animationFillMode: 'forwards',
          opacity: 0
        } : {}}>
          <Button
            onClick={handleStartGame}
            size="lg"
            className={`
              px-6 sm:px-8 py-3 sm:py-4 
              text-base sm:text-lg md:text-xl 
              font-bold font-creepster
              bg-gradient-to-r from-red-600 to-red-800 
              hover:from-red-500 hover:to-red-700
              border-2 border-red-400
              shadow-lg hover:shadow-red-500/50
              transform hover:scale-105 
              transition-all duration-300
              min-w-[200px] sm:min-w-[250px]
              ${isFirstTime && showGlitchEffect ? 'animate-pulse' : ''}
            `}
            style={{
              boxShadow: isFirstTime && showGlitchEffect ? 
                '0 0 30px rgba(139, 0, 0, 0.8)' : 
                '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}
          >
            {buttonText}
          </Button>
        </div>

        {/* Development Helper - Reset First Time Experience */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 sm:mt-4 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('hasSeenHeinousIntro');
                window.location.reload();
              }}
              className="text-xs sm:text-sm text-gray-600 hover:text-red-400 underline transition-colors duration-200"
            >
              [DEV] Reset First-Time Experience
            </button>
          </div>
        )}

        {/* Haunt Info - responsive footer */}
        <div className={`mt-6 sm:mt-8 text-center transition-all duration-1000 delay-1500 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}>
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            Haunt: <span className="text-orange-400 font-semibold">{currentHauntId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

