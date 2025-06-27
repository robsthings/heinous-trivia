import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { heinousSprites } from '@/lib/characterLoader';
import html2canvas from 'html2canvas';

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
        backgroundImage: 'url(/sidequests/monster-name-generator/monster-library-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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
        <div >
          <div 
            
            style={{
              top: `${scanLineProgress}%`,
              boxShadow: '0 0 20px #60a5fa, 0 0 40px #60a5fa',
              filter: 'blur(1px)'
            }}
          />
          <div 
            
            style={{
              top: `${scanLineProgress}%`,
              boxShadow: '0 0 10px #93c5fd'
            }}
          />
        </div>
      )}

      {/* Scanning text overlay */}
      {scanPhase === 'scanning' && (
        <div >
          <div  >
            <h2 >
              {currentScanText}
            </h2>
          </div>
        </div>
      )}

      {/* Dr. Heinous sprite with improved positioning */}
      {showHeinous && (
        <div  style={{ top: 'calc(50% - 2rem)' }}>
          <div >
            {/* Speech bubble positioned above sprite */}
            <div  style={{width: "1.25rem"}}>
              <div  >
                Hold still. This won't hurt… much.
              </div>
              {/* Speech bubble tail pointing down */}
              <div >
                <div ></div>
                <div ></div>
              </div>
            </div>
            
            {/* Dr. Heinous sprite with padding-top for Replit bar */}
            <img
              src={heinousSprites.charming}
              alt="Dr. Heinous"
              
              style={{ marginTop: '2rem' }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div >
        
        {/* Monster card - hidden during scanning, revealed when complete */}
        {showCard && (
          <div 
            ref={cardRef}
            
            style={{
              backgroundImage: 'url(/sidequests/monster-name-generator/monster-card.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Monster name display - always two lines */}
            <div >
              <div  >
                <h1 >
                  {monsterName.split(' ').map((word, index) => (
                    <div key={index} >
                      {word}
                    </div>
                  ))}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons - responsive layout */}
        {scanPhase === 'complete' && (
          <div >
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

            <Button
              onClick={handleReturnToGame}
              variant="ghost"
              
            >
              Return to Main Game
            </Button>
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