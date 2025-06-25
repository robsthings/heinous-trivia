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
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80 transition-all duration-75"
            style={{
              top: `${scanLineProgress}%`,
              boxShadow: '0 0 20px #60a5fa, 0 0 40px #60a5fa',
              filter: 'blur(1px)'
            }}
          />
          <div 
            className="absolute left-0 right-0 h-0.5 bg-blue-300 transition-all duration-75"
            style={{
              top: `${scanLineProgress}%`,
              boxShadow: '0 0 10px #93c5fd'
            }}
          />
        </div>
      )}

      {/* Scanning text overlay */}
      {scanPhase === 'scanning' && (
        <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
          <div className=" px-4" className="text-center">
            <h2 className="text-blue-400 text-xl sm:text-2xl md:text-3xl font-bold animate-pulse mb-4">
              {currentScanText}
            </h2>
          </div>
        </div>
      )}

      {/* Dr. Heinous sprite with improved positioning */}
      {showHeinous && (
        <div className="absolute left-4 sm:left-8 z-20" style={{ top: 'calc(50% - 2rem)' }}>
          <div className="relative">
            {/* Speech bubble positioned above sprite */}
            <div className="absolute -top-20 sm:-top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-red-600 rounded-lg px-3 py-2 w-48 sm:6 shadow-lg animate-fade-in z-10" style={{width: "1.25rem"}}>
              <div className="text-red-400 text-xs sm:text-sm font-semibold " className="text-center">
                Hold still. This won't hurt… much.
              </div>
              {/* Speech bubble tail pointing down */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-600"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
            
            {/* Dr. Heinous sprite with padding-top for Replit bar */}
            <img
              src={heinousSprites.charming}
              alt="Dr. Heinous"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl animate-sprite-idle-twitch"
              style={{ marginTop: '2rem' }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        
        {/* Monster card - hidden during scanning, revealed when complete */}
        {showCard && (
          <div 
            ref={cardRef}
            className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] mx-auto animate-fade-in"
            style={{
              backgroundImage: 'url(/sidequests/monster-name-generator/monster-card.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Monster name display - always two lines */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className=" px-6" className="text-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-nosifer text-red-500 leading-tight animate-fade-in">
                  {monsterName.split(' ').map((word, index) => (
                    <div key={index} className="block">
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
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 sm:gap-3 animate-fade-in w-full max-w-xs px-4">
            <Button
              onClick={handleScreenshot}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold w-full"
            >
              📸 Save Your Monster Card
            </Button>
            
            <Button
              onClick={startScan}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold w-full"
            >
              🔁 Generate Another
            </Button>

            <Button
              onClick={handleReturnToGame}
              variant="ghost"
              className="text-gray-400 hover:text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm w-full"
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