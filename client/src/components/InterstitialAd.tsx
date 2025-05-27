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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-900 via-black to-purple-900 animate-fade-in">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="font-nosifer text-4xl text-orange-500 mb-8 animate-pulse">
            A Message from Our Sponsors
          </h3>
          
          <img
            src={currentAd.image}
            alt={currentAd.title}
            className="w-full max-w-3xl h-96 object-cover rounded-xl mb-8 shadow-2xl border-4 border-red-600 mx-auto"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkIFNwYWNlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
            }}
          />
          
          <h4 className="text-3xl font-bold text-white mb-4 font-creepster">
            {currentAd.title}
          </h4>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
            {currentAd.description}
          </p>
          
          <div className="space-y-3">
            {currentAd.link && (
              <button
                className="horror-button w-full py-3 rounded-lg font-medium text-white"
                onClick={handleVisitAd}
              >
                Learn More
              </button>
            )}
            <button
              className="w-full py-3 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors"
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
