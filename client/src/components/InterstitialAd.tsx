import React from "react";
import type { GameState } from "@/lib/gameState";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";

// Consolidated ad tracking utility
async function trackAdMetric(hauntId: string, adIndex: number, metric: 'views' | 'clicks') {
  try {
    const metricsRef = doc(firestore, 'ad-metrics', hauntId, 'ads', `ad${adIndex}`);
    const docSnap = await getDoc(metricsRef);
    
    if (docSnap.exists()) {
      await updateDoc(metricsRef, { [metric]: increment(1) });
    } else {
      await setDoc(metricsRef, {
        views: metric === 'views' ? 1 : 0,
        clicks: metric === 'clicks' ? 1 : 0
      });
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
  if (!gameState.showAd || gameState.ads.length === 0) {
    return null;
  }

  const currentAd = gameState.ads[gameState.currentAdIndex % gameState.ads.length];
  const adIndex = gameState.currentAdIndex % gameState.ads.length;
  
  // Track ad view when component mounts
  React.useEffect(() => {
    trackAdMetric(gameState.currentHaunt, adIndex, 'views');
  }, [gameState.currentHaunt, adIndex]);

  const handleVisitAd = () => {
    if (currentAd.link) {
      trackAdMetric(gameState.currentHaunt, adIndex, 'clicks');
      onVisitAd(currentAd.link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="w-full h-full bg-gradient-to-br from-red-900 via-black to-purple-900 animate-fade-in">
        {/* Mobile Layout - Stack Content Vertically */}
        <div className="h-full flex flex-col p-3 sm:p-6">
          
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="font-nosifer text-lg sm:text-2xl md:text-3xl text-orange-500 animate-pulse leading-tight">
              A Message from Our Sponsors
            </h3>
          </div>
          
          {/* Ad Content - Flexible Height */}
          <div className="flex-1 flex flex-col justify-center items-center min-h-0">
            
            {/* Ad Image */}
            <div className="w-full max-w-sm sm:max-w-lg mb-4 sm:mb-6">
              <img
                src={currentAd.image}
                alt={currentAd.title}
                className="w-full h-40 sm:h-48 md:h-64 object-cover rounded-lg shadow-2xl border-2 border-red-600"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkIFNwYWNlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
            
            {/* Ad Text */}
            <div className="text-center max-w-sm sm:max-w-md">
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 font-creepster">
                {currentAd.title}
              </h4>
              <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                {currentAd.description}
              </p>
            </div>
          </div>
          
          {/* Buttons - Fixed at Bottom */}
          <div className="space-y-3 w-full max-w-sm mx-auto">
            {currentAd.link && (
              <button
                className="horror-button w-full py-4 rounded-lg font-medium text-white text-base touch-manipulation"
                onClick={handleVisitAd}
              >
                Learn More
              </button>
            )}
            <button
              className="w-full py-4 rounded-lg font-medium text-gray-300 border-2 border-gray-600 hover:bg-gray-800 transition-colors text-base touch-manipulation"
              onClick={onClose}
            >
              Continue Playing
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
