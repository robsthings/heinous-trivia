import { useState, useEffect } from "react";
// CUSTOM SKIN & PROGRESS BAR LOGIC
import { CustomProgressBar } from "./CustomProgressBar";
import type { HauntConfig } from "@shared/schema";

interface SpookyLoaderProps {
  message?: string;
  showProgress?: boolean;
  hauntConfig?: HauntConfig;
}

export function SpookyLoader({ 
  message = "Summoning the Spirits...", 
  showProgress = false,
  hauntConfig 
}: SpookyLoaderProps) {
  const [dots, setDots] = useState("...");
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const spookyMessages = [
    "Awakening Dr. Heinous...",
    "Gathering dark energies...",
    "Preparing the haunted trivia...",
    "Conjuring questions from beyond...",
    "Opening the portal to horror...",
    message
  ];

  useEffect(() => {
    // Animate dots
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        if (prev === ".") return "..";
        return "...";
      });
    }, 500);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % spookyMessages.length);
    }, 1500);

    // Simulate progress if enabled
    let progressInterval: NodeJS.Timeout;
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 200);
    }

    return () => {
      clearInterval(dotInterval);
      clearInterval(messageInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [message, showProgress, spookyMessages.length]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div 
              className="w-2 h-2 bg-orange-500 rounded-full opacity-70 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          </div>
        ))}
      </div>

      {/* Main loader */}
      <div className="glass-card rounded-xl p-8 text-center max-w-md w-full mx-4 relative z-10">
        {/* Haunt Logo or Default Icons */}
        <div className="mb-6 relative">
          {hauntConfig?.logoPath ? (
            <div className="relative">
              <img 
                src={hauntConfig.logoPath} 
                alt={hauntConfig.name || "Haunt Logo"}
                className="w-24 h-24 mx-auto object-contain animate-pulse"
              />
              <div className="absolute -inset-4 border border-red-500/20 rounded-full animate-pulse"></div>
              <div className="absolute -inset-8 border border-orange-500/10 rounded-full animate-ping"></div>
            </div>
          ) : (
            <div>
              <div className="text-6xl animate-pulse transform hover:scale-110 transition-transform duration-300">💀</div>
              <div className="absolute inset-0 text-6xl animate-ping opacity-30">👻</div>
              <div className="absolute -inset-4 border border-red-500/20 rounded-full animate-pulse"></div>
              <div className="absolute -inset-8 border border-orange-500/10 rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        {/* Loading text */}
        <h2 className="font-creepster text-2xl text-orange-500 mb-4 animate-pulse">
          {spookyMessages[currentMessage]}{dots}
        </h2>

        {/* CUSTOM SKIN & PROGRESS BAR LOGIC */}
        {/* Custom or default progress bar based on haunt tier */}
        <CustomProgressBar
          progress={showProgress ? progress : 60}
          hauntConfig={hauntConfig}
          className="mb-4"
        />

        {/* Flickering candles */}
        <div className="flex justify-center gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="relative">
              <div 
                className="text-2xl animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                🕯️
              </div>
              <div 
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-75"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            </div>
          ))}
        </div>

        {/* Creepy subtitle */}
        <p className="text-gray-400 text-sm mt-4 animate-pulse">
          Preparing your descent into madness...
        </p>
      </div>

      {/* Corner spiders */}
      <div className="absolute top-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>
        🕷️
      </div>
      <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>
        🕸️
      </div>
      <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '2s' }}>
        🦇
      </div>
      <div className="absolute bottom-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
        👁️
      </div>
    </div>
  );
}