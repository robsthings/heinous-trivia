import React from "react";
import type { GameState } from "@/lib/gameState";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";

// Ad tracking functions
async function trackAdView(hauntId: string, adIndex: number) {
  try {
    const metricsRef = doc(firestore, 'ad-metrics', hauntId, 'ads', `ad${adIndex}`);
    
    // Check if document exists
    const docSnap = await getDoc(metricsRef);
    if (docSnap.exists()) {
      await updateDoc(metricsRef, {
        views: increment(1)
      });
    } else {
      await setDoc(metricsRef, {
        views: 1,
        clicks: 0
      });
    }
    console.log(`📊 Tracked view for ad ${adIndex} in ${hauntId}`);
  } catch (error) {
    console.error('❌ Failed to track ad view:', error);
  }
}

async function trackAdClick(hauntId: string, adIndex: number) {
  try {
    const metricsRef = doc(firestore, 'ad-metrics', hauntId, 'ads', `ad${adIndex}`);
    
    // Check if document exists
    const docSnap = await getDoc(metricsRef);
    if (docSnap.exists()) {
      await updateDoc(metricsRef, {
        clicks: increment(1)
      });
    } else {
      await setDoc(metricsRef, {
        views: 0,
        clicks: 1
      });
    }
    console.log(`🎯 Tracked click for ad ${adIndex} in ${hauntId}`);
  } catch (error) {
    console.error('❌ Failed to track ad click:', error);
  }
}

interface InterstitialAdProps {
  gameState: GameState;
  onClose: () => void;
  onVisitAd: (link: string) => void;
}

export function InterstitialAd({ gameState, onClose, onVisitAd }: InterstitialAdProps) {
  if (!gameState.showAd || gameState.ads.length === 0) {
    console.log('⚠️ No ads to display:', { showAd: gameState.showAd, adCount: gameState.ads.length });
    return null;
  }

  const currentAd = gameState.ads[gameState.currentAdIndex % gameState.ads.length];
  const adIndex = gameState.currentAdIndex % gameState.ads.length;
  
  // Track ad view when component mounts
  React.useEffect(() => {
    trackAdView(gameState.currentHaunt, adIndex);
  }, [gameState.currentHaunt, adIndex]);
  
  // Log ad details as requested
  console.log('🎯 Displaying interstitial ad:', {
    adIndex: gameState.currentAdIndex,
    totalAds: gameState.ads.length,
    currentAdIndex: adIndex,
    imagePath: currentAd.image,
    title: currentAd.title,
    hasLink: !!currentAd.link,
    link: currentAd.link
  });

  const handleVisitAd = () => {
    if (currentAd.link) {
      trackAdClick(gameState.currentHaunt, adIndex);
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
              console.error('❌ Ad image failed to load:', currentAd.image);
              // Show placeholder if image fails
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkIFNwYWNlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
            }}
            onLoad={() => {
              console.log('✅ Ad image loaded successfully:', currentAd.image);
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
