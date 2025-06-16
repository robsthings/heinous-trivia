import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { heinousSprites } from '@/lib/characterLoader';
import html2canvas from 'html2canvas';

interface CrypticComplimentsProps {
  showHeinous?: boolean;
}

function CrypticComplimentsCore({ showHeinous = true }: CrypticComplimentsProps) {
  const [, navigate] = useLocation();
  const [gamePhase, setGamePhase] = useState<'initial' | 'gift' | 'parchment' | 'compliment'>('initial');
  const [currentCompliment, setCurrentCompliment] = useState('');
  const [complimentCount, setComplimentCount] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  // Mad lib components for compliment generation
  const complimentParts = {
    adjectives: [
      "gelatinous", "magnificent", "bewildering", "luminous", "ethereal", "grotesque",
      "sublime", "preposterous", "ghastly", "resplendent", "peculiar", "stupendous",
      "monstrous", "delightful", "abominable", "exquisite", "hideous", "spectacular"
    ],
    nouns: [
      "aristocrat", "creature", "specimen", "entity", "being", "wretch",
      "monstrosity", "aberration", "marvel", "horror", "wonder", "fiend",
      "phantom", "apparition", "manifestation", "anomaly", "terror", "beauty"
    ],
    connectors: [
      "radiating the mystique of",
      "embodying the essence of",
      "channeling the spirit of",
      "manifesting the aura of",
      "exuding the power of",
      "reflecting the glory of",
      "displaying the majesty of",
      "wielding the force of"
    ],
    metaphors: [
      "a cryptid's tax return",
      "midnight's forgotten sock",
      "a vampire's grocery list",
      "thunder's lost echo",
      "a ghost's diary entry",
      "starlight's secret recipe",
      "a demon's love letter",
      "chaos theory's homework",
      "a banshee's lullaby",
      "destiny's rough draft"
    ],
    closers: [
      "May your shadow never be questioned.",
      "Let your presence haunt all who witness it.",
      "May your existence perplex generations.",
      "Let your aura disturb the natural order.",
      "May your essence confound the universe.",
      "Let your being transcend mortal understanding.",
      "May your spirit bewilder eternity itself.",
      "Let your soul mystify the very cosmos."
    ]
  };

  const generateCompliment = () => {
    const adjective = complimentParts.adjectives[Math.floor(Math.random() * complimentParts.adjectives.length)];
    const noun = complimentParts.nouns[Math.floor(Math.random() * complimentParts.nouns.length)];
    const connector = complimentParts.connectors[Math.floor(Math.random() * complimentParts.connectors.length)];
    const metaphor = complimentParts.metaphors[Math.floor(Math.random() * complimentParts.metaphors.length)];
    const closer = complimentParts.closers[Math.floor(Math.random() * complimentParts.closers.length)];

    return `You ${adjective} ${noun}, ${connector} ${metaphor}. ${closer}`;
  };

  const handleParchmentClick = () => {
    if (complimentCount < 3) {
      const newCompliment = generateCompliment();
      setCurrentCompliment(newCompliment);
      setGamePhase('compliment');
      setComplimentCount(prev => prev + 1);
    }
  };

  const handleGenerateAnother = () => {
    if (complimentCount < 3) {
      const newCompliment = generateCompliment();
      setCurrentCompliment(newCompliment);
      setComplimentCount(prev => prev + 1);
    }
  };

  const handleScreenshot = async () => {
    const complimentElement = document.getElementById('compliment-card');
    if (complimentElement) {
      try {
        const canvas = await html2canvas(complimentElement, {
          backgroundColor: '#000000',
          scale: 2
        });
        
        const link = document.createElement('a');
        link.download = 'cryptic-compliment.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Screenshot failed:', error);
      }
    }
  };

  const handleReturnToGame = () => {
    navigate('/game/headquarters');
  };

  // Animation sequence
  useEffect(() => {
    // Start with charming sprite
    const timer1 = setTimeout(() => {
      setGamePhase('gift');
      setShowSpeechBubble(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setGamePhase('parchment');
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: 'url(/sidequests/cryptic-compliments/compliments-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      
      {showHeinous && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            {/* Speech bubble */}
            {showSpeechBubble && gamePhase === 'gift' && (
              <div className="absolute -top-24 -left-32 bg-gray-900 border-2 border-purple-600 rounded-lg px-4 py-3 w-64 shadow-lg animate-fade-in z-10">
                <div className="text-purple-400 text-sm font-semibold text-left">
                  A token of my distaste... for everyone else.
                </div>
                <div className="absolute top-full left-8">
                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
            
            {/* Character sprite */}
            <div className="relative">
              <img
                src={gamePhase === 'initial' ? heinousSprites.charming : heinousSprites.gift}
                alt="Dr. Heinous"
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl transition-all duration-500"
              />
              
              {/* Glowing parchment in palm */}
              {gamePhase === 'parchment' && (
                <div 
                  className="absolute bottom-8 left-12 w-8 h-10 cursor-pointer animate-pulse"
                  onClick={handleParchmentClick}
                  style={{
                    background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.4) 50%, transparent 100%)',
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    boxShadow: '0 0 20px rgba(255,215,0,0.6)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <div className="w-full h-full bg-yellow-200 rounded-sm opacity-80 flex items-center justify-center text-xs text-gray-800">
                    📜
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compliment display */}
      {gamePhase === 'compliment' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 p-4">
          <div 
            id="compliment-card"
            className="bg-gradient-to-br from-purple-900 via-gray-900 to-black border-2 border-purple-500 rounded-lg p-8 max-w-lg mx-auto text-center animate-scale-in shadow-2xl"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">
                Cryptic Compliment
              </h2>
              <div className="text-lg text-gray-200 leading-relaxed italic">
                "{currentCompliment}"
              </div>
            </div>
            
            <div className="text-xs text-purple-300 mb-6">
              — Dr. Heinous, Master of Backhanded Praise
            </div>
            
            <div className="flex flex-col gap-3">
              {complimentCount < 3 && (
                <Button
                  onClick={handleGenerateAnother}
                  className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 text-sm font-semibold w-full"
                >
                  Generate Another ({3 - complimentCount} left)
                </Button>
              )}
              
              <Button
                onClick={handleScreenshot}
                className="bg-yellow-700 hover:bg-yellow-600 text-white px-6 py-3 text-sm font-semibold w-full"
              >
                📸 Screenshot My Compliment
              </Button>
              
              <Button
                onClick={handleReturnToGame}
                variant="ghost"
                className="text-gray-400 hover:text-white px-6 py-3 text-sm w-full"
              >
                Return to Main Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CrypticCompliments() {
  return <CrypticComplimentsCore />;
}