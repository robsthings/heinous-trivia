import { useState, useEffect } from "react";
import type { GameState } from "@/lib/gameState";
import type { LeaderboardEntry } from "@shared/schema";

interface GameEndScreenProps {
  gameState: GameState;
  onSaveScore: (playerName?: string) => void;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  playerName?: string;
}

export function GameEndScreen({ 
  gameState, 
  onSaveScore, 
  onPlayAgain, 
  onViewLeaderboard,
  playerName: savedPlayerName
}: GameEndScreenProps) {
  const [playerName, setPlayerName] = useState("");

  if (!gameState.showEndScreen) {
    return null;
  }

  const handleSaveAndViewLeaderboard = async () => {
    // Save score if we have a name
    if (savedPlayerName) {
      await onSaveScore();
    } else if (playerName.trim()) {
      await onSaveScore(playerName.trim());
    }
    // Always show leaderboard after attempting to save
    onViewLeaderboard();
  };

  const handlePlayAgain = () => {
    if (savedPlayerName) {
      // Automatically save with the persistent player name
      onSaveScore();
    } else if (playerName.trim()) {
      // Fallback to manual input if no saved name
      onSaveScore(playerName.trim());
    }
    onPlayAgain();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="glass-card rounded-xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          {/* Haunt Logo */}
          {gameState.hauntConfig?.logoPath && (
            <div className="mb-6">
              <img 
                src={gameState.hauntConfig.logoPath} 
                alt={gameState.hauntConfig.name || "Haunt Logo"}
                className="w-24 h-24 mx-auto object-contain"
              />
            </div>
          )}
          <h2 className="font-creepster text-2xl sm:text-3xl text-orange-500 mb-2">Game Over</h2>
          <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Dr. Heinous is pleased with your performance...</p>
          
          <div className="bg-purple-900 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">{gameState.score}</div>
            <div className="text-white text-sm sm:text-base">Final Score</div>
            <div className="text-xs sm:text-sm text-gray-300 mt-2">
              <span>{gameState.correctAnswers}</span> of{" "}
              <span>{gameState.questionsAnswered}</span> correct
            </div>
          </div>

          {savedPlayerName ? (
            <div className="mb-4 sm:mb-6 text-center">
              <div className="text-gray-300 text-xs sm:text-sm mb-2">Playing as:</div>
              <div className="text-white font-bold text-base sm:text-lg">{savedPlayerName}</div>
              <div className="text-gray-400 text-xs mt-1">Score will be saved automatically</div>
            </div>
          ) : (
            <div className="mb-4 sm:mb-6">
              <input
                type="text"
                placeholder="Enter your name for the leaderboard"
                className="w-full p-3 rounded-lg bg-gray-800 border border-red-900 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm sm:text-base"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
              />
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <button
              className="horror-button w-full py-3 sm:py-4 rounded-lg font-medium text-white text-sm sm:text-base touch-manipulation"
              onClick={handleSaveAndViewLeaderboard}
            >
              Save Score & View Leaderboard
            </button>
            <button
              className="w-full py-3 sm:py-4 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors text-sm sm:text-base touch-manipulation"
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
            <button
              className="w-full py-3 sm:py-4 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors text-sm sm:text-base touch-manipulation"
              onClick={onViewLeaderboard}
            >
              View Leaderboard Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
