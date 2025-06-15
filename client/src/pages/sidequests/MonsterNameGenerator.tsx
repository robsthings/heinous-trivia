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
    setMonsterName('');
    
    // Scan progress animation
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.5; // Complete in 4 seconds
      });
    }, 100);

    // Cycling scan text
    scanningPhrases.forEach((phrase, index) => {
      setTimeout(() => {
        setCurrentScanText(phrase);
        if (index === scanningPhrases.length - 1) {
          // Generate name and complete scan
          setTimeout(() => {
            setMonsterName(generateMonsterName());
            setScanPhase('complete');
          }, 800);
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
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: 'url(/sidequests/monster-name-generator/monster-library-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Flash effect for screenshots */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white opacity-80 z-50 pointer-events-none" />
      )}

      {/* Dr. Heinous sprite */}
      {showHeinous && (
        <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-20">
          <img
            src={heinousSprites.charming}
            alt="Dr. Heinous"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl animate-sprite-idle-twitch"
          />
          
          {/* Speech bubble */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-red-600 rounded-lg px-3 py-2 max-w-48 shadow-lg animate-fade-in">
            <div className="text-red-400 text-xs sm:text-sm font-semibold text-center">
              Hold still. This won't hurt... much.
            </div>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-600"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        
        {/* Monster card */}
        <div 
          ref={cardRef}
          className="relative w-full max-w-md aspect-[3/4] mx-auto"
          style={{
            backgroundImage: 'url(/sidequests/monster-name-generator/monster-card.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Scan phase overlay */}
          {scanPhase === 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              
              {/* Scanning text */}
              <div className="mb-8 text-center">
                <h2 className="text-red-400 text-lg sm:text-xl font-bold animate-pulse">
                  {currentScanText}
                </h2>
              </div>

              {/* Animated scan bar */}
              <div className="relative w-3/4 h-64 border border-green-500 bg-black/50">
                <div 
                  className="absolute left-0 right-0 h-1 bg-green-500 shadow-lg shadow-green-500/50"
                  style={{
                    top: `${scanProgress}%`,
                    boxShadow: '0 0 10px #10b981, 0 0 20px #10b981, 0 0 30px #10b981'
                  }}
                >
                  <div className="absolute inset-0 bg-green-400 animate-pulse" />
                </div>
              </div>

              {/* Progress percentage */}
              <div className="mt-4 text-green-400 text-sm font-mono">
                {Math.round(scanProgress)}%
              </div>
            </div>
          )}

          {/* Complete phase - monster name display */}
          {scanPhase === 'complete' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-nosifer text-red-500 leading-tight animate-fade-in">
                  {monsterName}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {scanPhase === 'complete' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col gap-3 animate-fade-in">
            <Button
              onClick={handleScreenshot}
              className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 text-sm font-semibold"
            >
              📸 Save Your Monster Card
            </Button>
            
            <Button
              onClick={startScan}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-3 text-sm font-semibold"
            >
              🔁 Generate Another
            </Button>

            <Button
              onClick={handleReturnToGame}
              variant="ghost"
              className="text-gray-400 hover:text-white px-6 py-3 text-sm"
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