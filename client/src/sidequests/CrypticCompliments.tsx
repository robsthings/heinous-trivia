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
    author: "The Italian Renaissance"
  },
  {
    text: "The spirits dance with joy when you enter a room",
    author: "The Spectral Ballroom"
  },
  {
    text: "Your mysterious ways would make Nostradamus jealous",
    author: "The Oracle of Delphi"
  },
  {
    text: "Even black cats consider you their lucky charm",
    author: "The Feline Underworld"
  },
  {
    text: "Your enchanting darkness rivals the most beautiful eclipse",
    author: "The Celestial Court"
  },
  {
    text: "The werewolves howl your praises to the moon",
    author: "The Lupine Brotherhood"
  },
  {
    text: "Your gothic elegance makes Victorian ghosts swoon",
    author: "The Spirit of Gothic Literature"
  },
  {
    text: "Even fortune tellers can't predict how amazing you are",
    author: "Madame Zelda's Crystal Ball"
  },
  {
    text: "Your spine-chilling smile brightens the darkest dungeons",
    author: "The Medieval Torture Chamber"
  },
  {
    text: "The banshees sing lullabies in your honor",
    author: "The Irish Otherworld"
  }
];

export const CrypticCompliments: React.FC = () => {
  const [selectedCompliment, setSelectedCompliment] = useState<Compliment | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: gift, 1: paper-1, 2: paper-2, 3: paper-3, 4: paper-4 (final)

  const generateCompliment = () => {
    const randomCompliment = CRYPTIC_COMPLIMENTS[Math.floor(Math.random() * CRYPTIC_COMPLIMENTS.length)];
    setSelectedCompliment(randomCompliment);
    setShowSignature(false);
    setAnimationPhase(1);
    
    // Animation sequence: paper unfurling through 4 stages
    setTimeout(() => setAnimationPhase(2), 400);
    setTimeout(() => setAnimationPhase(3), 800);
    setTimeout(() => {
      setAnimationPhase(4);
      setIsRevealed(true);
    }, 1200);
    setTimeout(() => setShowSignature(true), 2700); // Signature appears after text burn-in
  };

  const resetCompliment = () => {
    setSelectedCompliment(null);
    setIsRevealed(false);
    setShowSignature(false);
    setAnimationPhase(0);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Background particles */}
      <div style={{
        position: 'absolute',
        inset: '0',
        opacity: '0.2'
      }}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              backgroundColor: '#a855f7',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 2}s infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: '10',
        textAlign: 'center',
        padding: '2rem 0'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 4rem)',
          fontWeight: 'bold',
          color: '#a855f7',
          marginBottom: '1rem',
          textShadow: '0 0 20px #a855f7',
          fontFamily: 'Creepster, cursive'
        }}>
          CRYPTIC COMPLIMENTS
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#d1d5db'
        }}>
          Receive mysterious praise from the beyond
        </p>
      </div>

      {/* Dr. Heinous - only show when gift box is displayed */}
      {animationPhase === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: '20',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <img 
              src="/sidequests/cryptic-compliments/gift.png" 
              alt="Dr. Heinous with Gift" 
              style={{
                width: 'clamp(16rem, 40vw, 24rem)',
                height: 'clamp(16rem, 40vw, 24rem)',
                display: 'block'
              }}
            />
            {/* Gift box positioned at bottom center of his hand */}
            <div 
              onClick={generateCompliment}
              style={{
                position: 'absolute',
                bottom: '0%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(3rem, 8vw, 5rem)',
                height: 'clamp(3rem, 8vw, 5rem)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: '30'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.15)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
            >
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #9333ea 0%, #581c87 100%)',
                borderRadius: '0.5rem',
                border: '2px solid #a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)'
              }}>
                🎁
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1rem',
        position: 'relative',
        zIndex: '10'
      }}>
        
        {/* Additional UI Elements below character */}
        {animationPhase === 0 && (
          <div style={{ 
            textAlign: 'center',
            position: 'relative',
            marginTop: '22rem',
            zIndex: '10'
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#a855f7',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #a855f7',
              maxWidth: '300px',
              margin: '0 auto 1.5rem auto',
              backdropFilter: 'blur(10px)'
            }}>
              A gift from the darkness...
            </div>
            
            <h2 style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
              color: '#d8b4fe',
              marginBottom: '2rem',
              textShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
            }}>
              A mysterious gift awaits...
            </h2>
            
            <button
              onClick={generateCompliment}
              style={{
                padding: '1rem 2.5rem',
                background: 'linear-gradient(to right, #9333ea, #581c87)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                borderRadius: '0.75rem',
                border: '2px solid #a855f7',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #4c1d95)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(168, 85, 247, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #581c87)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(168, 85, 247, 0.4)';
              }}
            >
              OPEN GIFT
            </button>
          </div>
        )}

        {/* Paper Animation Phases */}
        {animationPhase > 0 && animationPhase < 4 && (
          <div style={{
            maxWidth: '32rem',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <img 
              src={`/sidequests/cryptic-compliments/paper-${animationPhase}.png`}
              alt={`Paper unfurling stage ${animationPhase}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                animation: 'unfurl 0.4s ease-out'
              }}
            />
          </div>
        )}

        {/* Final Parchment with Text (phase 4) */}
        {animationPhase === 4 && selectedCompliment && (
          <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
            <div style={{
              position: 'relative',
              textAlign: 'center'
            }}>
              <img 
                src="/sidequests/cryptic-compliments/paper-4.png"
                alt="Final parchment"
                style={{
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
              
              {/* Text overlay on parchment */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '70%',
                maxWidth: '350px',
                padding: '0 1rem'
              }}>
                {/* Burn-in text effect */}
                <div style={{
                  animation: isRevealed ? 'burnIn 2s ease-out forwards' : 'none',
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#451a03'
                }}>
                  <p style={{
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.4rem)',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    textShadow: '1px 1px 2px rgba(245, 158, 11, 0.3)'
                  }}>
                    "{selectedCompliment.text}"
                  </p>
                  
                  {/* Signature */}
                  {showSignature && (
                    <div style={{
                      textAlign: 'right',
                      animation: 'fadeIn 1s ease-out',
                      fontFamily: "'Homemade Apple', cursive"
                    }}>
                      <p style={{
                        fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
                        color: '#92400e'
                      }}>
                        — {selectedCompliment.author}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={generateCompliment}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #9333ea, #581c87)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.5rem',
                    border: '2px solid #a855f7',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textShadow: '0 0 10px rgba(0,0,0,0.5)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #4c1d95)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #581c87)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Another Compliment
                </button>
                
                <button
                  onClick={resetCompliment}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #4b5563, #1f2937)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.5rem',
                    border: '2px solid #6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #6b7280, #374151)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #1f2937)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Reset Gift
                </button>
              </div>
              
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #dc2626, #991b1b)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  border: '2px solid #ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #b91c1c)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #991b1b)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Return to Game
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
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
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
        `
      }} />
    </div>
  );
};

