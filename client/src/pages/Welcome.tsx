import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export function Welcome() {
  const { hauntId } = useParams<{ hauntId: string }>();
  const [, setLocation] = useLocation();
  const [isReturning, setIsReturning] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [showCursor, setShowCursor] = useState<boolean>(true);

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

  // Initialize typewriter effect once on mount
  useEffect(() => {
    const heinousTaunts = isReturning
      ? ["Back for more punishment?"]
      : [
          "A new victim approaches...",
          "Fresh meat!",
          "Welcome to your doom!",
          "You dare challenge me?",
          "Prepare for heinous horrors!",
          "Another soul for my collection...",
          "The darkness welcomes you!",
          "Dare ye enter my domain?",
          "Let the horror begin!"
        ];
    
    const selectedTaunt = heinousTaunts[Math.floor(Math.random() * heinousTaunts.length)];
    let currentIndex = 0;
    
    const typewriterInterval = setInterval(() => {
      currentIndex++;
      const newText = selectedTaunt.slice(0, currentIndex);
      setDisplayedText(newText);
      
      if (currentIndex >= selectedTaunt.length) {
        clearInterval(typewriterInterval);
      }
    }, 100);

    return () => clearInterval(typewriterInterval);
  }, [isReturning]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Standard cursor blink rate

    return () => clearInterval(cursorInterval);
  }, []);
  
  // Force refresh trigger

  return (
    <div 
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: 'url("/backgrounds/lab-dark-blue.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-4 " style={{textAlign: "center"}}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(55,65,81,0.7), rgba(0,0,0,0.8))'
        }}
      >
        
        {/* Dr. Heinous Character with Speech Bubble */}
        <div className="relative " style={{marginBottom: "1.5rem"}}>
          {/* Speech Bubble */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              top: '-4rem',
              backgroundColor: '#111827',
              border: '2px solid #dc2626',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              animation: 'speech-bubble-in 0.8s ease-out'
            }}
          >
            <span 
              style={{
                color: '#f87171',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              {displayedText || '\u00A0'}
              <span style={{ 
                opacity: showCursor ? 1 : 0,
                marginLeft: '1px',
                transition: 'opacity 0.1s ease'
              }}>|</span>
            </span>
            {/* Triangle tail */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #dc2626'
              }}
            />
          </div>
          
          {/* Character Image */}
          <img 
            src="/heinous/charming.png" 
            alt="Dr. Heinous" 
            className="object-contain"
            style={{
              width: '16rem',
              height: 'auto',
              filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))'
            }}
          />
        </div>

        {/* Welcome Title */}
        <h1 
          style={{
            fontFamily: '"Nosifer", cursive',
            color: '#f97316',
            fontSize: 'clamp(1.5rem, 8vw, 4rem)',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '0s',
            animationFillMode: 'forwards',
            opacity: 1
          }}
        >
          Welcome Back
        </h1>
        
        {/* Subtext */}
        <p 
          style={{
            color: '#9ca3af',
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}
        >
          Ready for another spine-chilling round of trivia?
        </p>

        {/* Play Again Button */}
        <button
          onClick={handleStartGame}
          style={{
            fontFamily: '"Creepster", cursive',
            background: 'linear-gradient(to right, #dc2626, #991b1b)',
            color: 'white',
            border: '2px solid #f87171',
            borderRadius: '0.375rem',
            padding: '0.75rem 2rem',
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            minWidth: '12rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 20px 25px -5px rgb(239 68 68 / 0.5), 0 8px 10px -6px rgb(239 68 68 / 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(to right, #dc2626, #991b1b)';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)';
          }}
        >
          PLAY AGAIN
        </button>

        {/* Haunt Label */}
        <div 
          style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            marginTop: '1rem'
          }}
        >
          Haunt: <span style={{ color: '#fb923c', fontWeight: '600' }}>{hauntId}</span>
        </div>
      </div>
    </div>
  );
}

