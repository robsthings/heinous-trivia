import { useState } from "react";
import { Link } from "wouter";
import html2canvas from "html2canvas";

export function CrypticCompliments() {
  const [phase, setPhase] = useState<"intro" | "unfurling" | "revealed">("intro");
  const [compliment, setCompliment] = useState("");
  const [isTextRevealed, setIsTextRevealed] = useState(false);
  const [unfurlingFrame, setUnfurlingFrame] = useState(1);
  const [heinousReaction, setHeinousReaction] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);


  const complimentComponents = {
    adjectives: [
      "magnificent", "gelatinous", "otherworldly", "bewildering", "cryptic",
      "enigmatic", "shadowy", "spectral", "ethereal", "haunting"
    ],
    nouns: [
      "aristocrat", "phantom", "apparition", "wraith", "entity",
      "creature", "being", "soul", "spirit", "essence"
    ],
    connectors: [
      "radiating the mystique of", "embodying the essence of", "channeling the energy of",
      "wielding the power of", "harboring the secrets of", "carrying the wisdom of"
    ],
    metaphors: [
      "a cryptid's tax return", "an ancient tome's bookmark", "a ghost's favorite playlist",
      "a vampire's sunscreen", "a werewolf's grooming kit", "a banshee's lullaby"
    ],
    closers: [
      "May your shadow never be questioned.", "Your aura is magnificently unsettling.",
      "You possess a truly haunting charm.", "Your presence is delightfully ominous.",
      "You are wonderfully mysterious."
    ]
  };

  const heinousReactions = [
    "Did I mean that? Who knows.",
    "Take this. You're exhausting.",
    "That's the nicest I've been all decade.",
    "That's... shockingly accurate."
  ];

  const startParchmentUnfurling = () => {
    setPhase("unfurling");
    
    // Generate compliment
    const adjective = complimentComponents.adjectives[Math.floor(Math.random() * complimentComponents.adjectives.length)];
    const noun = complimentComponents.nouns[Math.floor(Math.random() * complimentComponents.nouns.length)];
    const connector = complimentComponents.connectors[Math.floor(Math.random() * complimentComponents.connectors.length)];
    const metaphor = complimentComponents.metaphors[Math.floor(Math.random() * complimentComponents.metaphors.length)];
    const closer = complimentComponents.closers[Math.floor(Math.random() * complimentComponents.closers.length)];

    const newCompliment = `You ${adjective} ${noun}, ${connector} ${metaphor}. ${closer}`;
    setCompliment(newCompliment);
    
    // Random reaction
    setHeinousReaction(heinousReactions[Math.floor(Math.random() * heinousReactions.length)]);

    // Animate through paper frames
    let currentFrame = 1;
    const frameInterval = setInterval(() => {
      currentFrame++;
      setUnfurlingFrame(currentFrame);
      
      if (currentFrame >= 4) {
        clearInterval(frameInterval);
        // Start text reveal after parchment is fully unfurled
        setTimeout(() => {
          setPhase("revealed");
          setIsTextRevealed(true);
          // Show signature 1.5 seconds after text appears
          setTimeout(() => {
            setShowSignature(true);
            // Mark signature as complete after animation duration
            setTimeout(() => {
              setSignatureComplete(true);
            }, 2500); // Allow time for GIF to complete one cycle
          }, 1500);
        }, 300);
      }
    }, 250);
  };



  const takeScreenshot = async () => {
    const element = document.getElementById('compliment-display');
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = 'heinous-compliment.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const resetGame = () => {
    setPhase("intro");
    setCompliment("");
    setIsTextRevealed(false);
    setUnfurlingFrame(1);
    setHeinousReaction("");
    setShowSignature(false);
    setSignatureComplete(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #581c87, #000000, #581c87)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div 
        style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: "url('/sidequests/cryptic-compliments/compliments-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}
      />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '56rem',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {phase === "intro" && (
          <div style={{
            animation: 'scale-in 0.5s ease-out'
          }}>
            {/* Title */}
            <h1 style={{
              fontSize: '2.25rem',
              fontFamily: '"Nosifer", cursive',
              color: '#e9d5ff',
              marginBottom: '2rem'
            }}>CRYPTIC COMPLIMENTS</h1>
            
            {/* Dr. Heinous with Gift */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                position: 'relative',
                display: 'inline-block'
              }}>
                <img 
                  src="/heinous/gift.png"
                  alt="Dr. Heinous offering a gift" 
                  style={{
                    width: '16rem',
                    height: '16rem',
                    margin: '0 auto',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onClick={startParchmentUnfurling}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                {/* Soft pulsing glow */}
                <div ></div>
              </div>
              
              {/* Speech Bubble */}
              <div >
                <div >
                  <p >
                    I have something for you... I think.
                  </p>
                  <div ></div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div >
              <p>Click Dr. Heinous to receive your... gift</p>
            </div>
          </div>
        )}

        {(phase === "unfurling" || phase === "revealed") && (
          <div  id="compliment-display">
            {/* Parchment Animation Container */}
            <div >
              <img 
                src={`/sidequests/cryptic-compliments/paper-${unfurlingFrame}.png`}
                alt="Parchment unfurling"
                `}
              />
              
              {/* Compliment Text Overlay - positioned over the parchment */}
              {phase === "revealed" && isTextRevealed && (
                <div  style={{alignItems: "center"}}>
                  <div  style={{textAlign: "center"}} style={{ maxWidth: '400px', marginTop: '5px' }}>
                    <p >
                      "{compliment}"
                    </p>
                    {showSignature && (
                      <div >
                        <div 
                          
                          style={{
                            marginLeft: "auto", // Right align the container
                            width: "120px", // Fixed width to prevent repositioning
                            display: "flex",
                            justifyContent: "flex-end"
                          }}
                        >
                          <img 
                            src="/heinous/signature.gif"
                            alt="Dr. Heinous Signature"
                            
                            style={{
                              filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))",
                              animationPlayState: signatureComplete ? 'paused' : 'running',
                              animationIterationCount: signatureComplete ? '1' : 'infinite'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dr. Heinous Reaction */}
            {phase === "revealed" && isTextRevealed && (
              <div >
                <img 
                  src="/heinous/neutral.png"
                  alt="Dr. Heinous" 
                  
                />
                <p >
                  "{heinousReaction}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {phase === "revealed" && isTextRevealed && (
              <div  style={{alignItems: "center"}}>
                <button
                  onClick={takeScreenshot}
                   style={{alignItems: "center"}}
                >
                  📸 Screenshot My Compliment
                </button>
                
                <button
                  onClick={resetGame}
                  
                >
                  Get Another Gift
                </button>
                
                <Link 
                  href="/game/headquarters"
                  
                >
                  Return to Main Game
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}