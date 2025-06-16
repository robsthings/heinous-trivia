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

const sliceEffects: SliceData[] = [
  {
    id: 0,
    label: "Cursed!",
    effect: "Purple sparks surround you!",
    animationClass: "curse-sparks",
    reactionLine: "Excellent! You've been properly cursed.",
    icon: "💀"
  },
  {
    id: 1,
    label: "Mystery Prize",
    effect: "A glowing ticket appears...",
    animationClass: "mystery-glow",
    reactionLine: "What could it be? Even I don't know.",
    icon: "🎟"
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
    label: "Physical Challenge",
    effect: "A challenge awaits your mortal form...",
    animationClass: "challenge-prompt",
    reactionLine: "Show me your pathetic human movements!",
    icon: "👁"
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
    label: "Unknowable Insight",
    effect: "Ancient wisdom flows through you...",
    animationClass: "cosmic-insight",
    reactionLine: "The universe whispers its secrets to you.",
    icon: "💥"
  }
];

const physicalChallenges = [
  "Do the zombie shuffle for 10 seconds",
  "Perform a dramatic villain laugh",
  "Strike a superhero pose",
  "Do the robot dance",
  "Pretend to cast a spell",
  "Act like a haunted tree in the wind",
  "Do your best monster walk",
  "Perform a theatrical bow"
];

export function WheelOfMisfortune() {
  const [gamePhase, setGamePhase] = useState<"intro" | "spinning" | "result" | "physical-challenge" | "witnesseth" | "verification">("intro");
  const [selectedSlice, setSelectedSlice] = useState<SliceData | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [eyePhase, setEyePhase] = useState<"zoom-out" | "blinking" | "witnesseth">("zoom-out");
  const [eyeOpen, setEyeOpen] = useState(true);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setGamePhase("spinning");
    
    // Randomly select a slice
    const randomSlice = sliceEffects[Math.floor(Math.random() * sliceEffects.length)];
    setSelectedSlice(randomSlice);
    
    // Calculate rotation to land on selected slice
    // Each slice is 45 degrees (360/8), pointer points to top center
    const sliceAngle = 45;
    const extraSpins = 5 + Math.random() * 3; // 5-8 full rotations for more dramatic effect
    
    // Calculate the angle needed to position the selected slice at the top (under the pointer)
    // For slice 0 to be at top, we need 0 degrees rotation
    // For slice 1 to be at top, we need -45 degrees rotation (rotate counterclockwise)
    // For slice 2 to be at top, we need -90 degrees rotation, etc.
    const targetAngle = -(randomSlice.id * sliceAngle);
    
    // Add extra spins and calculate total rotation
    const totalRotation = wheelRotation + (extraSpins * 360) + targetAngle;
    
    setWheelRotation(totalRotation);
    
    // Handle spin completion
    setTimeout(() => {
      setIsSpinning(false);
      
      if (randomSlice.id === 5) { // Physical Challenge
        setGamePhase("physical-challenge");
        setCurrentChallenge(physicalChallenges[Math.floor(Math.random() * physicalChallenges.length)]);
        startPhysicalChallenge();
      } else {
        setGamePhase("result");
      }
    }, 8000);
  };

  const startPhysicalChallenge = () => {
    // Start with zoom-out effect
    setEyePhase("zoom-out");
    setEyeOpen(true);
    
    // After zoom-out, start blinking sequence
    setTimeout(() => {
      setEyePhase("blinking");
      const blinkInterval = setInterval(() => {
        setEyeOpen(prev => !prev);
      }, 800); // Slower, more deliberate blinks
      
      // After blinking, show witnesseth button
      setTimeout(() => {
        clearInterval(blinkInterval);
        setEyePhase("witnesseth");
        setEyeOpen(true);
      }, 4000); // 4 seconds of blinking
    }, 2000); // 2 seconds for zoom-out
  };

  const handleWitnesseth = () => {
    setGamePhase("verification");
  };

  const handleChallengeVerification = (completed: boolean) => {
    setChallengeCompleted(completed);
    setGamePhase("result");
  };

  const resetGame = () => {
    setGamePhase("intro");
    setSelectedSlice(null);
    setIsSpinning(false);
    setCurrentChallenge("");
    setEyePhase("zoom-out");
    setEyeOpen(true);
    setChallengeCompleted(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-purple-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('/sidequests/wheel-of-misfortune/wheel-bg.png')"
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        {/* Banner */}
        <div className="mb-8">
          <img 
            src="/sidequests/wheel-of-misfortune/wheel-banner.png"
            alt="Wheel of Misfortune"
            className="max-w-md w-full h-auto mx-auto"
          />
        </div>

        {/* Dr. Heinous Speech */}
        <div className="mb-8">
          <div className="bg-gray-900 border-2 border-purple-400 rounded-lg p-4 max-w-md mx-auto relative">
            <p className="text-purple-100 text-lg font-creepster">
              {gamePhase === "intro" && "Step right up! Spin my wheel of delicious misfortune!"}
              {gamePhase === "spinning" && "The wheel of fate turns..."}
              {gamePhase === "result" && selectedSlice && selectedSlice.reactionLine}
              {gamePhase === "physical-challenge" && selectedSlice && selectedSlice.reactionLine}
            </p>
            <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-purple-400"></div>
          </div>
        </div>

        {/* Dr. Heinous & Wheel Side by Side */}
        <div className="mb-8 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
          {/* Dr. Heinous Presenting */}
          <div className="flex-shrink-0">
            <img 
              src="/heinous/presenting.png"
              alt="Dr. Heinous presenting"
              className="w-40 h-40 lg:w-48 lg:h-48"
            />
          </div>

          {/* Spinning Wheel */}
          <div className="relative flex-shrink-0">
            <img 
              src="/sidequests/wheel-of-misfortune/wheel.png"
              alt="Wheel of Misfortune"
              className="w-72 h-72 lg:w-80 lg:h-80 transition-transform duration-[8000ms]"
              style={{
                transitionTimingFunction: isSpinning ? 'cubic-bezier(0.11, 0, 0.5, 0)' : 'ease-out',
                transform: `rotate(${wheelRotation}deg)`,
                filter: isSpinning ? 'blur(1px)' : 'blur(0px)',
                transitionDuration: '8s'
              }}
            />
            
            {/* Skeleton Pointer - Fixed Position */}
            <img 
              src="/sidequests/wheel-of-misfortune/pointer-skeleton.png"
              alt="Skeleton pointer"
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-16 h-16 z-10"
            />
          </div>
        </div>

        {/* Effect Animations */}
        {gamePhase === "result" && selectedSlice && (
          <div className={`effect-container ${selectedSlice.animationClass} mb-6`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-purple-300 mb-2">{selectedSlice.label}</h2>
              <p className="text-xl text-purple-200">{selectedSlice.effect}</p>
              
              {/* Physical Challenge Result */}
              {selectedSlice.id === 5 && challengeCompleted !== null && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  challengeCompleted 
                    ? 'bg-green-900/30 border-green-500/50' 
                    : 'bg-red-900/30 border-red-500/50'
                }`}>
                  <p className={`text-lg font-bold ${
                    challengeCompleted ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {challengeCompleted 
                      ? "Excellent! Your physical prowess impresses even me!" 
                      : "Pathetic! Your weakness amuses me greatly."}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Challenge: {currentChallenge}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Physical Challenge Display */}
        {gamePhase === "physical-challenge" && (
          <div className="mb-8 text-center">
            {/* Eye Through Phone Experience */}
            <div className="mb-6 flex justify-center">
              <img 
                src={`/sidequests/wheel-of-misfortune/eye-${eyeOpen ? 'open' : 'closed'}.png`}
                alt="Dr. Heinous Eye"
                className={`transition-all duration-1000 ${
                  eyePhase === "zoom-out" ? "w-64 h-64 animate-pulse" : "w-32 h-32"
                } ${eyePhase === "blinking" ? "animate-pulse" : ""}`}
              />
            </div>
            
            {/* Witnesseth Button */}
            {eyePhase === "witnesseth" && (
              <div className="flex justify-center">
                <button
                  onClick={handleWitnesseth}
                  className="transition-all hover:scale-105"
                >
                  <img 
                    src="/sidequests/wheel-of-misfortune/witnesseth.png"
                    alt="Witnesseth"
                    className="w-32 h-12"
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verification Phase */}
        {gamePhase === "verification" && (
          <div className="mb-8 text-center">
            <div className="bg-gray-900/50 border border-gray-500/50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">Physical Challenge</h3>
              <p className="text-lg text-gray-200 mb-4">{currentChallenge}</p>
              <p className="text-md text-gray-300 mb-6">Did they complete the physical challenge?</p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleChallengeVerification(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  YES
                </button>
                <button
                  onClick={() => handleChallengeVerification(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  NO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {gamePhase === "intro" && (
            <button
              onClick={spinWheel}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
            >
              🎰 Spin the Wheel!
            </button>
          )}
          
          {(gamePhase === "result") && (
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
    </div>
  );
}