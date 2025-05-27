import type { GameState } from "@/lib/gameState";

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

  const handleVisitAd = () => {
    if (currentAd.link) {
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
