import { useState } from "react";
import { Link } from "wouter";

interface SliceData {
  id: number;
  label: string;
  effect: string;
  animationClass: string;
  reactionLine: string;
  icon: string;
}

// 8 Wheel outcomes - now including "Missed Call from the Void"
const sliceEffects: SliceData[] = [
  {
    id: 1,
    label: "Cursed",
    effect: "Dark energy swirls around you!",
    animationClass: "curse-swirl",
    reactionLine: "Mwahahaha! You've been cursed!",
    icon: "💀"
  },
  {
    id: 2,
    label: "Ghosted",
    effect: "Spectral winds sweep around you!",
    animationClass: "ghost-swoosh",
    reactionLine: "You've been thoroughly ghosted.",
    icon: "👻"
  },
  {
    id: 3,
    label: "Doomlight Savings Time",
    effect: "Time itself begins to melt...",
    animationClass: "time-melt",
    reactionLine: "Time is but an illusion. A melting one.",
    icon: "🕰"
  },
  {
    id: 4,
    label: "Cringe Echo",
    effect: "Your most embarrassing moment echoes!",
    animationClass: "cringe-flash",
    reactionLine: "Even I felt that secondhand embarrassment.",
    icon: "😈"
  },
  {
    id: 5,
    label: "Missed Call from the Void",
    effect: "You receive a voicemail from beyond the void.",
    animationClass: "void-call",
    reactionLine: "Probably another call about a car's extended warranty.",
    icon: "📞"
  },
  {
    id: 6,
    label: "Glory by Accident",
    effect: "Magnificent fireworks explode around you!",
    animationClass: "accidental-fireworks",
    reactionLine: "How wonderfully... accidental.",
    icon: "💫"
  },
  {
    id: 7,
    label: "Mystery Prize",
    effect: "A mysterious gift appears before you!",
    animationClass: "mystery-shimmer",
    reactionLine: "Not all mysteries are worth solving...",
    icon: "🎁"
  },
  {
    id: 8,
    label: "Unknowable Insight",
    effect: "Forbidden knowledge fills your mind!",
    animationClass: "insight-glow",
    reactionLine: "Some knowledge comes with a price...",
    icon: "🧠"
  }
];

export function WheelOfMisfortune() {
  const [gamePhase, setGamePhase] = useState<"intro" | "spinning" | "result">("intro");
  const [selectedSlice, setSelectedSlice] = useState<SliceData | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [doomlightTime, setDoomlightTime] = useState<string>("0.013");

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setGamePhase("spinning");
    
    // Randomly select a slice
    const randomSlice = sliceEffects[Math.floor(Math.random() * sliceEffects.length)];
    setSelectedSlice(randomSlice);
    
    // If Doomlight Savings Time is selected, generate random time between 0.001 and 1.000
    if (randomSlice.id === 3) {
      const randomTime = (Math.random() * 0.999 + 0.001).toFixed(3);
      setDoomlightTime(randomTime);
    }
    
    // Calculate rotation to land on selected slice
    // Each slice is 45 degrees (360/8), pointer points to top center
    const sliceAngle = 45;
    const sliceIndex = randomSlice.id - 1;
    const targetAngle = sliceIndex * sliceAngle;
    
    // Add multiple full rotations (5-8 spins) for dramatic effect
    const fullRotations = 5 + Math.random() * 3; // 5-8 rotations
    const totalRotation = wheelRotation + (fullRotations * 360) + (360 - targetAngle);
    
    setWheelRotation(totalRotation);
    
    // Handle spin completion
    setTimeout(() => {
      setIsSpinning(false);
      setGamePhase("result");
    }, 8000);
  };

  const resetGame = () => {
    setGamePhase("intro");
    setSelectedSlice(null);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-purple-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url('/sidequests/wheel-of-misfortune/laboratory-background.jpg')`
        }}
      />
      
      {/* Intro Phase */}
      {gamePhase === "intro" && (
        <div className="text-center mb-8 z-10">
          <h1 className="text-5xl font-bold text-purple-300 mb-4 animate-pulse">
            Wheel of Misfortune
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            Dare to spin Dr. Heinous's wheel of chaotic consequences!
          </p>
        </div>
      )}

      {/* Game Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 z-10 w-full max-w-6xl">
        {/* Dr. Heinous Sprite */}
        <div className="flex-shrink-0 order-1 lg:order-1">
          <img 
            src="/heinous/presenting.png"
            alt="Dr. Heinous presenting the wheel"
            className="w-48 h-48 lg:w-64 lg:h-64 object-contain"
          />
        </div>

        {/* Wheel Container */}
        <div className="flex-shrink-0 order-2 lg:order-2">
          <div className="relative">
            {/* Wheel */}
            <div 
              className={`w-80 h-80 lg:w-96 lg:h-96 rounded-full border-8 border-purple-400 shadow-2xl transition-transform ${
                isSpinning 
                  ? 'duration-[8000ms] ease-[cubic-bezier(0.11,0,0.5,0)]' 
                  : 'duration-1000 ease-out'
              } ${isSpinning ? 'blur-sm' : ''}`}
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                backgroundImage: `url('/sidequests/wheel-of-misfortune/wheel-8-slice.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Pointer */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10"
            >
              <img 
                src="/sidequests/wheel-of-misfortune/pointer.png"
                alt="Wheel Pointer"
                className="w-8 h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dr. Heinous Reaction */}
      {gamePhase === "result" && selectedSlice && (
        <div className="mt-8 text-center z-10">
          <div className="bg-gray-900/80 border border-purple-500/50 rounded-lg p-6 max-w-lg mx-auto backdrop-blur-sm">
            <p className="text-lg text-purple-200 italic mb-4">
              "{selectedSlice.reactionLine}"
            </p>
            <p className="text-sm text-gray-400">— Dr. Heinous</p>
          </div>
        </div>
      )}

      {/* Effect Animations */}
      {gamePhase === "result" && selectedSlice && (
        <div className={`effect-container ${selectedSlice.animationClass} mb-6`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-purple-300 mb-2">{selectedSlice.label}</h2>
            <p className="text-xl text-purple-200">
              {selectedSlice.id === 3 
                ? `We just sucked ${doomlightTime} seconds from your life!`
                : selectedSlice.effect
              }
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center z-10 mt-8">
        {gamePhase === "intro" && (
          <button
            onClick={spinWheel}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
          >
            🎰 Spin the Wheel!
          </button>
        )}
        
        {gamePhase === "result" && (
          <>
            <button
              onClick={resetGame}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Spin Again
            </button>
            
            <Link 
              href="/game/headquarters"
              className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 no-underline"
            >
              Return to Main Game
            </Link>
          </>
        )}
      </div>
    </div>
  );
}