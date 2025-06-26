import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface MonsterNameGeneratorProps {
  showHeinous?: boolean;
}

function MonsterNameGeneratorCore({ showHeinous = true }: MonsterNameGeneratorProps) {
  const [, navigate] = useLocation();
  const [scanPhase, setScanPhase] = useState<'scanning' | 'complete'>('scanning');
  const [currentScanText, setCurrentScanText] = useState('');
  const [monsterName, setMonsterName] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [scanLineProgress, setScanLineProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const adjectives = [
    "Gloopy", "Cryptic", "Snarling", "Chittering", "Pustulent", 
    "Barbed", "Doomed", "Festering", "Vile", "Writhing", 
    "Spectral", "Malevolent", "Rotting", "Ghastly"
  ];

  const creatures = [
    "Fiend", "Ghoul", "Wretch", "Lurker", "Wailer", 
    "Banshee", "Beast", "Goblyn", "Shade", "Spawn",
    "Revenant", "Aberration", "Horror", "Nightmare"
  ];

  const scanningPhrases = [
    "Scanning Subject...",
    "Analyzing Bone Structure...", 
    "Detecting Curses...",
    "Soul Searching...",
    "Monster Name Acquired!"
  ];

  const generateMonsterName = () => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomCreature = creatures[Math.floor(Math.random() * creatures.length)];
    return `${randomAdjective} ${randomCreature}`;
  };

  const startScan = () => {
    setScanPhase('scanning');
    setScanProgress(0);
    setScanLineProgress(0);
    setMonsterName('');
    setShowCard(false);
    
    // Full-screen scan line animation (4 seconds)
    const scanLineInterval = setInterval(() => {
      setScanLineProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanLineInterval);
          return 100;
        }
        return prev + 1; // Complete in 4 seconds
      });
    }, 40);

    // Cycling scan text
    scanningPhrases.forEach((phrase, index) => {
      setTimeout(() => {
        setCurrentScanText(phrase);
        if (index === scanningPhrases.length - 1) {
          // Generate name and show card after scan line completes
          setTimeout(() => {
            setMonsterName(generateMonsterName());
            setShowCard(true);
            setScanPhase('complete');
          }, 500);
        }
      }, index * 800);
    });
  };

  useEffect(() => {
    startScan();
  }, []);

  const handleScreenshot = async () => {
    if (!cardRef.current) return;

    setIsFlashing(true);
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `monster-card-${monsterName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
    }

    setTimeout(() => setIsFlashing(false), 200);
  };

  const handleReturnToGame = () => {
    navigate('/game/headquarters');
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }} />
      
      {/* Flash effect for screenshots */}
      {isFlashing && (
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: '#ffffff',
          opacity: 0.8,
          zIndex: 50,
          pointerEvents: 'none'
        }} />
      )}

      {/* Full-screen scan line animation */}
      {scanPhase === 'scanning' && scanLineProgress < 100 && (
        <div style={{ position: 'absolute', inset: '0', zIndex: '30', pointerEvents: 'none' }}>
          <div 
            style={{
              position: 'absolute',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(to right, transparent, #60a5fa, transparent)',
              opacity: '0.8',
              transition: 'all 75ms',
              top: `${scanLineProgress}%`,
              boxShadow: '0 0 20px #60a5fa, 0 0 40px #60a5fa',
              filter: 'blur(1px)'
            }}
          />
          <div 
            style={{
              position: 'absolute',
              left: '0',
              right: '0',
              height: '2px',
              background: '#93c5fd',
              transition: 'all 75ms',
              top: `${scanLineProgress}%`,
              boxShadow: '0 0 10px #93c5fd'
            }}
          />
        </div>
      )}

      {/* Scanning text overlay */}
      {scanPhase === 'scanning' && (
        <div style={{ position: 'absolute', inset: '0', zIndex: '25', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              color: '#60a5fa', 
              fontSize: 'clamp(1.25rem, 4vw, 1.875rem)', 
              fontWeight: 'bold', 
              animation: 'pulse 2s infinite', 
              marginBottom: '1rem' 
            }}>
              {currentScanText}
            </h2>
          </div>
        </div>
      )}

      {/* Dr. Heinous sprite with improved positioning */}
      {showHeinous && (
        <div style={{ position: 'absolute', left: 'clamp(1rem, 4vw, 2rem)', zIndex: '20', top: 'calc(50% - 2rem)' }}>
          <div style={{ position: 'relative' }}>
            {/* Speech bubble positioned above sprite */}
            <div style={{
              position: 'absolute',
              top: 'clamp(-5rem, -12vw, -6rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#111827',
              border: '2px solid #dc2626',
              borderRadius: '0.5rem',
              padding: 'clamp(0.5rem, 2vw, 0.75rem)',
              width: 'clamp(12rem, 24vw, 15rem)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: '10'
            }}>
              <div style={{
                color: '#f87171',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Hold still. This won't hurt… much.
              </div>
              {/* Speech bubble tail pointing down */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                <div style={{
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #dc2626'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid #111827'
                }}></div>
              </div>
            </div>
            
            {/* Dr. Heinous sprite with padding-top for Replit bar */}
            <img
              src="/heinous/charming.png"
              alt="Dr. Heinous"
              style={{
                width: 'clamp(6rem, 12vw, 10rem)',
                height: 'clamp(6rem, 12vw, 10rem)',
                objectFit: 'contain',
                filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))',
                marginTop: '2rem'
              }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: '10', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
        
        {/* Monster card - hidden during scanning, revealed when complete */}
        {showCard && (
          <div 
            ref={cardRef}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 'clamp(20rem, 50vw, 28rem)',
              aspectRatio: '3/4',
              margin: '0 auto',
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #10b981',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}
          >
            {/* Monster name display - always two lines */}
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h1 style={{
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
                fontFamily: 'Nosifer, system-ui, sans-serif',
                color: '#ef4444',
                lineHeight: '1.2'
              }}>
                {monsterName.split(' ').map((word, index) => (
                  <div key={index} style={{ display: 'block' }}>
                    {word}
                  </div>
                ))}
              </h1>
            </div>
          </div>
        )}

        {/* Action buttons - responsive layout */}
        {scanPhase === 'complete' && (
          <div style={{
            position: 'absolute',
            bottom: 'clamp(1rem, 4vw, 2rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(0.5rem, 2vw, 0.75rem)',
            width: '100%',
            maxWidth: '20rem',
            padding: '0 1rem'
          }}>
            <button
              onClick={handleScreenshot}
              style={{
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                width: '100%',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6d28d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7c3aed';
              }}
            >
              📸 Save Your Monster Card
            </button>
            
            <button
              onClick={startScan}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #f97316',
                color: '#f97316',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                width: '100%',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f97316';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#f97316';
              }}
            >
              🔁 Generate Another
            </button>

            <button
              onClick={handleReturnToGame}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                width: '100%',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Return to Main Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Route wrapper component
export function MonsterNameGenerator() {
  return <MonsterNameGeneratorCore />;
}