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
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-xl p-6 max-w-sm w-full animate-fade-in">
        <div className="text-center">
          <h3 className="font-nosifer text-xl text-orange-500 mb-4">
            A Message from Our Sponsors
          </h3>
          
          <img
            src={currentAd.image}
            alt={currentAd.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          
          <h4 className="text-lg font-medium text-white mb-2">
            {currentAd.title}
          </h4>
          <p className="text-gray-300 text-sm mb-4">
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
