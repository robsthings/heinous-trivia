import { useState } from "react";
import { Link } from "wouter";
import html2canvas from "html2canvas";

export function CrypticCompliments() {
  const [phase, setPhase] = useState<"intro" | "unfurling" | "revealed">("intro");
  const [compliment, setCompliment] = useState("");
  const [revealText, setRevealText] = useState("");
  const [unfurlingFrame, setUnfurlingFrame] = useState(1);
  const [heinousReaction, setHeinousReaction] = useState("");

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
          startTextReveal(newCompliment);
        }, 300);
      }
    }, 250);
  };

  const startTextReveal = (text: string) => {
    setPhase("revealed");
    let currentIndex = 0;
    
    const revealInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setRevealText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(revealInterval);
      }
    }, 50); // Letter-by-letter reveal
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
    setRevealText("");
    setUnfurlingFrame(1);
    setHeinousReaction("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-purple-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('/sidequests/cryptic-compliments/compliments-bg.png')"
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        {phase === "intro" && (
          <div className="animate-scale-in">
            {/* Title */}
            <h1 className="text-4xl font-nosifer text-purple-200 mb-8">CRYPTIC COMPLIMENTS</h1>
            
            {/* Dr. Heinous with Gift */}
            <div className="mb-8">
              <div className="relative inline-block">
                <img 
                  src="/heinous/gift.png"
                  alt="Dr. Heinous offering a gift" 
                  className="w-64 h-64 mx-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={startParchmentUnfurling}
                />
                {/* Soft pulsing glow */}
                <div className="absolute inset-0 bg-yellow-400 opacity-20 rounded-full blur-xl animate-pulse pointer-events-none"></div>
              </div>
              
              {/* Speech Bubble */}
              <div className="mt-6 relative">
                <div className="bg-gray-900 border-2 border-purple-400 rounded-lg p-4 max-w-md mx-auto relative">
                  <p className="text-purple-100 text-lg font-creepster">
                    I have something for you... I think.
                  </p>
                  <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-purple-400"></div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-purple-200 text-xl">
              <p>Click Dr. Heinous to receive your... gift</p>
            </div>
          </div>
        )}

        {(phase === "unfurling" || phase === "revealed") && (
          <div className="animate-scale-in" id="compliment-display">
            {/* Parchment Animation Container */}
            <div className="mb-8 flex justify-center relative">
              <img 
                src={`/sidequests/cryptic-compliments/paper-${unfurlingFrame}.png`}
                alt="Parchment unfurling"
                className="max-w-lg w-full h-auto"
              />
              
              {/* Compliment Text Overlay - positioned over the parchment */}
              {phase === "revealed" && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="max-w-sm w-full text-center">
                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-serif italic">
                      "{revealText}"
                    </p>
                    {revealText.length === compliment.length && (
                      <div className="mt-4 text-sm text-gray-600 animate-fade-in">
                        - Dr. Heinous
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dr. Heinous Reaction */}
            {phase === "revealed" && revealText.length === compliment.length && (
              <div className="mb-8 animate-fade-in">
                <img 
                  src="/heinous/neutral.png"
                  alt="Dr. Heinous" 
                  className="w-32 h-32 mx-auto"
                />
                <p className="text-purple-200 text-lg font-creepster mt-4">
                  "{heinousReaction}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {phase === "revealed" && revealText.length === compliment.length && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                <button
                  onClick={takeScreenshot}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors duration-200 flex items-center gap-2"
                >
                  📸 Screenshot My Compliment
                </button>
                
                <button
                  onClick={resetGame}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors duration-200 text-sm"
                >
                  Get Another Gift
                </button>
                
                <Link 
                  href="/game/headquarters"
                  className="text-purple-300 hover:text-purple-100 underline font-bold"
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