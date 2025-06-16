import React, { useState } from 'react';
import { Link } from 'wouter';

interface SliceEffect {
  id: number;
  label: string;
  description: string;
  animationClass: string;
  reactionLine: string;
  color: string;
}

const sliceEffects: SliceEffect[] = [
  {
    id: 0,
    label: "Cursed!",
    description: "Dark magic surrounds you...",
    animationClass: "cursed-sparks",
    reactionLine: "Ah yes, the curse finds you! Delicious despair!",
    color: "#8B5CF6"
  },
  {
    id: 1,
    label: "Mystery Prize",
    description: "A glowing ticket appears...",
    animationClass: "mystery-glow",
    reactionLine: "Ooh, mysterious! What could it be? I'm not telling!",
    color: "#F59E0B"
  },
  {
    id: 2,
    label: "Ghosted",
    description: "Spectral energy flows through you...",
    animationClass: "ghost-swoosh",
    reactionLine: "Boo! You've been ghosted by the supernatural realm!",
    color: "#E5E7EB"
  },
  {
    id: 3,
    label: "Doomlight Savings Time",
    description: "Time melts away...",
    animationClass: "time-melt",
    reactionLine: "We just sucked 0.666 seconds from your life!",
    color: "#10B981"
  },
  {
    id: 4,
    label: "Cringe Echo",
    description: "Your most embarrassing moment echoes...",
    animationClass: "cringe-flash",
    reactionLine: "Oof! That memory still haunts you, doesn't it?",
    color: "#EF4444"
  },
  {
    id: 5,
    label: "Physical Challenge",
    description: "Time to prove your worth...",
    animationClass: "challenge-blink",
    reactionLine: "Show me what you're made of, mortal!",
    color: "#F97316"
  },
  {
    id: 6,
    label: "Glory by Accident",
    description: "Fireworks of fortune explode!",
    animationClass: "glory-fireworks",
    reactionLine: "Well, well! Even a broken clock is right twice a day!",
    color: "#FBBF24"
  },
  {
    id: 7,
    label: "Unknowable Insight",
    description: "Cosmic wisdom flows...",
    animationClass: "insight-reveal",
    reactionLine: "The stars whisper... but I won't tell you what they said!",
    color: "#8B5CF6"
  }
];

const physicalChallenges = [
  "Do the zombie shuffle for 10 seconds",
  "Howl like a werewolf three times",
  "Perform the vampire cape swirl",
  "Channel your inner ghost and float around",
  "Do the monster mash dance",
  "Cackle like a witch for 5 seconds"
];

export default function WheelOfMisfortune() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<SliceEffect | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showPhysicalChallenge, setShowPhysicalChallenge] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState('');
  const [eyeBlinking, setEyeBlinking] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;

    // Reset states
    setShowResult(false);
    setShowPhysicalChallenge(false);
    setEyeBlinking(false);
    
    // Randomly select slice
    const randomIndex = Math.floor(Math.random() * 8);
    const selectedEffect = sliceEffects[randomIndex];
    
    // Calculate rotation to land on selected slice
    // Each slice is 45 degrees (360/8), pointer is at top (0 degrees)
    const sliceAngle = 45;
    const targetAngle = randomIndex * sliceAngle;
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = (spins * 360) + (360 - targetAngle);
    
    setIsSpinning(true);
    setRotation(finalRotation);
    
    // Show result after spin animation
    setTimeout(() => {
      setSelectedSlice(selectedEffect);
      setIsSpinning(false);
      
      if (selectedEffect.id === 5) {
        // Physical Challenge - start eye blinking sequence
        setEyeBlinking(true);
        const challenge = physicalChallenges[Math.floor(Math.random() * physicalChallenges.length)];
        setCurrentChallenge(challenge);
        
        setTimeout(() => {
          setEyeBlinking(false);
          setShowPhysicalChallenge(true);
        }, 3000);
      } else {
        setShowResult(true);
      }
    }, 3000);
  };

  const handleWitnesseth = () => {
    setShowPhysicalChallenge(false);
    setShowResult(true);
  };

  const playAgain = () => {
    setSelectedSlice(null);
    setShowResult(false);
    setShowPhysicalChallenge(false);
    setEyeBlinking(false);
    setRotation(0);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/sidequests/wheel-of-misfortune/wheel-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        {/* Title Banner */}
        <div className="text-center mb-8">
          <img
            src="/sidequests/wheel-of-misfortune/wheel-banner.png"
            alt="Wheel of Misfortune"
            className="mx-auto max-w-md w-full h-auto"
          />
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Dr. Heinous Presenter */}
          <div className="order-2 lg:order-1">
            {eyeBlinking ? (
              <div className="relative">
                <img
                  src="/heinous/neutral.png"
                  alt="Dr. Heinous"
                  className={`w-48 h-48 object-contain transition-opacity duration-500 ${eyeBlinking ? 'animate-pulse' : ''}`}
                />
                <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-full" />
              </div>
            ) : (
              <img
                src="/heinous/presenting.png"
                alt="Dr. Heinous Presenting"
                className="w-48 h-48 object-contain"
              />
            )}
          </div>

          {/* Wheel Container */}
          <div className="order-1 lg:order-2 relative">
            {/* Spinning Wheel */}
            <div className="relative w-80 h-80">
              <img
                src="/sidequests/wheel-of-misfortune/wheel.png"
                alt="Wheel of Misfortune"
                className={`w-full h-full transition-transform duration-[3000ms] ease-out ${
                  isSpinning ? 'animate-spin-fast' : ''
                }`}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: isSpinning ? 'blur(2px)' : 'none'
                }}
              />
              
              {/* Pointer */}
              <img
                src="/sidequests/wheel-of-misfortune/pointer-skeleton.png"
                alt="Pointer"
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-16 h-16 z-10"
              />
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="text-center mt-8">
          {!isSpinning && !showResult && !showPhysicalChallenge && (
            <button
              onClick={spinWheel}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Spin the Wheel
            </button>
          )}

          {isSpinning && (
            <div className="text-2xl text-red-300 animate-pulse">
              The wheel of fate is turning...
            </div>
          )}
        </div>

        {/* Physical Challenge Sequence */}
        {eyeBlinking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <img
                  src="/heinous/neutral.png"
                  alt="Dr. Heinous Eye"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
              <p className="text-red-300 text-xl">Preparing your challenge...</p>
            </div>
          </div>
        )}

        {showPhysicalChallenge && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-red-900/80 border-2 border-red-500 rounded-lg p-8 max-w-md text-center">
              <h3 className="text-2xl font-bold text-red-300 mb-4">Physical Challenge!</h3>
              <p className="text-xl text-red-200 mb-6">{currentChallenge}</p>
              <button
                onClick={handleWitnesseth}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Witnesseth!
              </button>
            </div>
          </div>
        )}

        {/* Result Display */}
        {showResult && selectedSlice && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-black/80 border-2 rounded-lg p-8 max-w-md text-center"
              style={{ borderColor: selectedSlice.color }}
            >
              <h3 
                className="text-3xl font-bold mb-4"
                style={{ color: selectedSlice.color }}
              >
                {selectedSlice.label}
              </h3>
              <p className="text-xl text-red-200 mb-4">{selectedSlice.description}</p>
              <p className="text-lg text-red-300 mb-6 italic">"{selectedSlice.reactionLine}"</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={playAgain}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Spin Again
                </button>
                <Link href="/game/headquarters">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Return to Main Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dr. Heinous Reaction */}
        {selectedSlice && !showPhysicalChallenge && (
          <div className="text-center mt-8">
            <div className="bg-black/70 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-300 italic">"{selectedSlice.reactionLine}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}