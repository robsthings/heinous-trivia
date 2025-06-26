import React, { useState } from 'react';

interface Compliment {
  text: string;
  author: string;
}

const CRYPTIC_COMPLIMENTS: Compliment[] = [
  {
    text: "Your soul radiates darkness in the most delightful way",
    author: "The Shadow Council"
  },
  {
    text: "Even the demons speak fondly of your wicked charm",
    author: "Beelzebub's Secretary"
  },
  {
    text: "Your presence makes the void feel less empty",
    author: "The Abyss"
  },
  {
    text: "The ravens whisper your name with admiration",
    author: "Edgar Allan Poe's Ghost"
  },
  {
    text: "Your malevolent grin could launch a thousand nightmares",
    author: "The Nightmare Realm"
  },
  {
    text: "Even the Grim Reaper takes notes on your style",
    author: "Death Himself"
  },
  {
    text: "Your dark aura is absolutely mesmerizing",
    author: "Count Dracula"
  },
  {
    text: "The gargoyles nod approvingly when you pass",
    author: "Notre Dame Cathedral"
  },
  {
    text: "Your sinister laugh could heal a broken heart",
    author: "The Phantom of the Opera"
  },
  {
    text: "Even the ancient curses speak of your magnificence",
    author: "The Egyptian Underworld"
  },
  {
    text: "Your wicked intelligence puts Machiavelli to shame",
    author: "The Dark Arts Academy"
  },
  {
    text: "The storm clouds gather just to witness your beauty",
    author: "Mother Nature's Evil Twin"
  }
];

export function CrypticCompliments() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedCompliment, setSelectedCompliment] = useState<Compliment | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  const generateCompliment = () => {
    const randomCompliment = CRYPTIC_COMPLIMENTS[Math.floor(Math.random() * CRYPTIC_COMPLIMENTS.length)];
    setSelectedCompliment(randomCompliment);
    setIsRevealed(true);
    setShowSignature(false);
    
    // Show signature after compliment text animation
    setTimeout(() => {
      setShowSignature(true);
    }, 1500);
  };

  const resetCompliment = () => {
    setIsRevealed(false);
    setSelectedCompliment(null);
    setShowSignature(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Creepster', cursive"
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 text-center py-8">
        <h1 
          className="text-4xl md:text-6xl font-bold text-purple-400 mb-4"
          style={{ textShadow: '0 0 20px #a855f7' }}
        >
          CRYPTIC COMPLIMENTS
        </h1>
        <p className="text-lg text-gray-300">
          Receive mysterious praise from the beyond
        </p>
      </div>

      {/* Dr. Heinous */}
      <div className="absolute top-16 right-8 z-20">
        <img 
          src="/heinous/gift.png" 
          alt="Dr. Heinous with Gift" 
          className="w-20 h-20 md:w-24 md:h-24"
        />
        <div className="absolute -left-32 top-2 bg-black bg-opacity-80 text-purple-400 text-sm px-3 py-2 rounded-lg border border-purple-400">
          A gift from the darkness...
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        
        {/* Gift Box (before reveal) */}
        {!isRevealed && (
          <div className="text-center">
            <div 
              className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={generateCompliment}
            >
              <div 
                className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-900 rounded-lg border-4 border-purple-400 flex items-center justify-center text-6xl"
                style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
              >
                🎁
              </div>
            </div>
            
            <h2 className="text-2xl text-purple-300 mb-4">
              A mysterious gift awaits...
            </h2>
            
            <button
              onClick={generateCompliment}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-lg rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              style={{ 
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
              }}
            >
              OPEN GIFT
            </button>
          </div>
        )}

        {/* Parchment Scroll (after reveal) */}
        {isRevealed && selectedCompliment && (
          <div className="max-w-2xl mx-auto">
            <div 
              className="relative bg-gradient-to-br from-amber-100 to-amber-200 p-8 md:p-12 rounded-lg border-4 border-amber-600 transform rotate-[-1.5deg] transition-all duration-1000 animate-[unfurl_1s_ease-out]"
              style={{ 
                boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 0 20px rgba(245, 158, 11, 0.1)',
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
              }}
            >
              {/* Burn-in text effect */}
              <div 
                className="text-center animate-[burnIn_2s_ease-out_forwards]"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#451a03'
                }}
              >
                <p 
                  className="text-lg md:text-xl leading-relaxed mb-6"
                  style={{
                    textShadow: '1px 1px 2px rgba(245, 158, 11, 0.3)',
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)'
                  }}
                >
                  "{selectedCompliment.text}"
                </p>
                
                {/* Signature */}
                {showSignature && (
                  <div 
                    className="text-right animate-[fadeIn_1s_ease-out]"
                    style={{ fontFamily: "'Homemade Apple', cursive" }}
                  >
                    <p className="text-base md:text-lg text-amber-800">
                      — {selectedCompliment.author}
                    </p>
                  </div>
                )}
              </div>

              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-amber-600 opacity-60"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-amber-600 opacity-60"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-amber-600 opacity-60"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-amber-600 opacity-60"></div>
            </div>

            {/* Action buttons */}
            <div className="text-center mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={generateCompliment}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  style={{ 
                    textShadow: '0 0 10px rgba(0,0,0,0.5)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  Another Compliment
                </button>
                
                <button
                  onClick={resetCompliment}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold rounded-lg border-2 border-gray-400 hover:from-gray-500 hover:to-gray-700 transition-all duration-200 transform hover:scale-105"
                >
                  Reset Gift
                </button>
              </div>
              
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                Return to Game
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes unfurl {
          0% { 
            transform: scale(0.1) rotate(-1.5deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.1) rotate(-1.5deg); 
            opacity: 0.8; 
          }
          100% { 
            transform: scale(1) rotate(-1.5deg); 
            opacity: 1; 
          }
        }
        
        @keyframes burnIn {
          0% { 
            opacity: 0;
            filter: brightness(0) contrast(0);
            text-shadow: 0 0 20px #f59e0b;
          }
          50% { 
            opacity: 0.7;
            filter: brightness(1.5) contrast(1.2);
            text-shadow: 0 0 10px #f59e0b, 1px 1px 2px rgba(245, 158, 11, 0.3);
          }
          100% { 
            opacity: 1;
            filter: brightness(1) contrast(1);
            text-shadow: 1px 1px 2px rgba(245, 158, 11, 0.3);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}