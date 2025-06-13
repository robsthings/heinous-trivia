import React, { useState, useEffect } from "react";
import type { GameState } from "@/lib/gameState";

// Consolidated ad tracking utility
async function trackAdMetric(hauntId: string, adIndex: number, metric: 'views' | 'clicks') {
  try {
    const response = await fetch(`/api/ad-metrics/${hauntId}/${adIndex}/${metric}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to track ad metric');
    }
  } catch (error) {
    console.error(`❌ Failed to track ad ${metric}:`, error);
  }
}

interface InterstitialAdProps {
  gameState: GameState;
  onClose: () => void;
  onVisitAd: (link: string) => void;
}

export function InterstitialAd({ gameState, onClose, onVisitAd }: InterstitialAdProps) {
  const [showTransition, setShowTransition] = useState(true);
  const [adImageLoaded, setAdImageLoaded] = useState(false);
  
  // Track current ad index to ensure transition shows for each new ad
  const [lastAdIndex, setLastAdIndex] = useState(-1);

  // Safe data extraction with fallbacks
  const isValidAd = gameState.showAd && gameState.ads.length > 0;
  const currentAd = isValidAd ? gameState.ads[gameState.currentAdIndex % gameState.ads.length] : null;
  const adIndex = isValidAd ? gameState.currentAdIndex % gameState.ads.length : 0;
  const hauntLogoPath = gameState.currentHaunt ? `/haunts/${gameState.currentHaunt}/logo` : '';
  const logoSrc = gameState.hauntConfig?.logoPath || hauntLogoPath;

  // Preload the ad image - only when valid ad exists
  useEffect(() => {
    if (!currentAd) return;
    
    const imageSrc = currentAd.image || currentAd.imageUrl;
    if (imageSrc) {
      const img = new Image();
      img.onload = () => setAdImageLoaded(true);
      img.onerror = () => setAdImageLoaded(true); // Still proceed even if image fails
      img.src = imageSrc as string;
    } else {
      setAdImageLoaded(true); // No image to load
    }
  }, [currentAd?.image, currentAd?.imageUrl]);

  // Reset transition state when ad index changes (new ad appears)
  useEffect(() => {
    if (!isValidAd) return;
    
    const currentAdIndex = gameState.currentAdIndex % gameState.ads.length;
    
    // If this is a new ad (different index), reset transition
    if (currentAdIndex !== lastAdIndex) {
      setShowTransition(true);
      setLastAdIndex(currentAdIndex);
    }
  }, [gameState.currentAdIndex, gameState.ads.length, isValidAd, lastAdIndex]);

  // Handle transition timing - only when showing valid ad
  useEffect(() => {
    if (!isValidAd || !showTransition) return;
    
    // End transition after 1.8s (matching animation duration)
    const transitionTimer = setTimeout(() => {
      setShowTransition(false);
    }, 1800);

    return () => {
      clearTimeout(transitionTimer);
    };
  }, [isValidAd, showTransition]);
  
  // Track ad view when component mounts - only for valid ads
  useEffect(() => {
    if (!isValidAd || !currentAd) return;
    
    trackAdMetric(gameState.currentHaunt, adIndex, 'views');
  }, [gameState.currentHaunt, adIndex, isValidAd]);

  // Early return after all hooks have been called
  if (!isValidAd || !currentAd) {
    return null;
  }

  const handleVisitAd = () => {
    if (currentAd.link && currentAd.link !== '#' && currentAd.link.startsWith('http')) {
      trackAdMetric(gameState.currentHaunt, adIndex, 'clicks');
      onVisitAd(currentAd.link);
    }
  };

  // Check if we have a valid link
  const hasValidLink = currentAd.link && currentAd.link !== '#' && currentAd.link.startsWith('http');

  // Transition Component with logo
  if (showTransition) {
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-hidden flex items-center justify-center">
        <div className="relative">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Haunt Logo"
              className="w-32 h-32 object-contain animate-logo-transition"
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-hidden backdrop-blur-sm">
      <div className="w-full h-full">
        {/* Mobile-First Responsive Layout */}
        <div className="h-full flex flex-col justify-between p-4 max-w-md mx-auto lg:max-w-4xl">
          
          {/* Header - Compact on mobile */}
          <div className="text-center py-2 flex-shrink-0">
            <h3 className="font-nosifer text-base sm:text-xl lg:text-3xl text-orange-500 animate-pulse leading-tight">
              A Message from Our Sponsors
            </h3>

          </div>
          
          {/* Main Content - Centered and Responsive */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-4 min-h-0">
            
            {/* Ad Image - Full display */}
            <div className="w-full px-4">
              <div className="w-full bg-gradient-to-br from-purple-900 to-red-900 rounded-lg shadow-2xl border-2 border-red-600 p-8 text-center max-h-[50vh] sm:max-h-[60vh] flex flex-col justify-center">
                <div className="text-6xl mb-4">🎃</div>
                <h4 className="font-nosifer text-xl text-orange-400 mb-3">
                  {currentAd.title}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentAd.description}
                </p>
              </div>
              <img
                src={currentAd.image || currentAd.imageUrl}
                alt={currentAd.title}
                className="hidden w-full max-h-[70vh] h-auto object-contain rounded-lg shadow-2xl border-2 border-red-600"
                onLoad={(e) => {
                  // Show the image and hide the fallback if it loads successfully
                  const target = e.target as HTMLImageElement;
                  const fallback = target.previousElementSibling as HTMLElement;
                  target.classList.remove('hidden');
                  fallback.style.display = 'none';
                }}
                onError={(e) => {
                  // Create a better fallback image with haunt branding
                  const canvas = document.createElement('canvas');
                  canvas.width = 800;
                  canvas.height = 400;
                  const ctx = canvas.getContext('2d');
                  
                  if (ctx) {
                    // Dark horror-themed background
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillRect(0, 0, 800, 400);
                    
                    // Red accent border
                    ctx.strokeStyle = '#8B0000';
                    ctx.lineWidth = 8;
                    ctx.strokeRect(4, 4, 792, 392);
                    
                    // Title text
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 36px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(currentAd.title || 'Advertisement', 400, 180);
                    
                    // Subtitle
                    ctx.fillStyle = '#cccccc';
                    ctx.font = '24px Arial';
                    ctx.fillText('Heinous Trivia Sponsor', 400, 220);
                    
                    // Description if available
                    if (currentAd.description) {
                      ctx.fillStyle = '#aaaaaa';
                      ctx.font = '18px Arial';
                      const words = currentAd.description.split(' ');
                      let line = '';
                      let y = 260;
                      
                      for (let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const metrics = ctx.measureText(testLine);
                        const testWidth = metrics.width;
                        if (testWidth > 600 && n > 0) {
                          ctx.fillText(line, 400, y);
                          line = words[n] + ' ';
                          y += 25;
                        } else {
                          line = testLine;
                        }
                      }
                      ctx.fillText(line, 400, y);
                    }
                  }
                  
                  e.currentTarget.src = canvas.toDataURL();
                }}
              />
            </div>
            
            {/* Ad Text - Compact on mobile */}
            <div className="text-center px-4 max-w-xs sm:max-w-sm lg:max-w-xl">
              <h4 className="text-base sm:text-lg lg:text-2xl font-bold text-white mb-2 font-creepster line-clamp-2">
                {currentAd.title}
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3">
                {currentAd.description}
              </p>
            </div>
          </div>
          
          {/* Action Buttons - Always visible at bottom */}
          <div className="space-y-3 w-full max-w-xs sm:max-w-sm mx-auto flex-shrink-0 pt-4">
            {/* Only show Learn More button if valid link exists */}
            {hasValidLink && (
              <button
                className="w-full py-3 sm:py-4 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base select-none"
                onClick={handleVisitAd}
                style={{ touchAction: 'manipulation' }}
              >
                Learn More
              </button>
            )}
            <button
              className="w-full py-3 sm:py-4 rounded-lg font-medium text-gray-300 border-2 border-gray-600 hover:bg-gray-800 transition-colors text-sm sm:text-base select-none"
              onClick={onClose}
              style={{ touchAction: 'manipulation' }}
            >
              Continue Playing
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
