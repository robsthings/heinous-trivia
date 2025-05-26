import { useState } from "react";
import type { GameState } from "@/lib/gameState";

interface GameEndScreenProps {
  gameState: GameState;
  onSaveScore: (playerName: string) => void;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

export function GameEndScreen({ 
  gameState, 
  onSaveScore, 
  onPlayAgain, 
  onViewLeaderboard 
}: GameEndScreenProps) {
  const [playerName, setPlayerName] = useState("");

  if (!gameState.showEndScreen) {
    return null;
  }

  const handleSaveAndRestart = () => {
    if (playerName.trim()) {
      onSaveScore(playerName.trim());
    }
    onPlayAgain();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-xl p-6 max-w-md w-full animate-fade-in">
        <div className="text-center">
          <h2 className="font-creepster text-3xl text-orange-500 mb-2">Game Over</h2>
          <p className="text-gray-300 mb-6">Dr. Heinous is pleased with your performance...</p>
          
          <div className="bg-purple-900 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-orange-500 mb-2">{gameState.score}</div>
            <div className="text-white">Final Score</div>
            <div className="text-sm text-gray-300 mt-2">
              <span>{gameState.correctAnswers}</span> of{" "}
              <span>{gameState.questionsAnswered}</span> correct
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your name for the leaderboard"
              className="w-full p-3 rounded-lg bg-gray-800 border border-red-900 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <button
              className="horror-button w-full py-3 rounded-lg font-medium text-white"
              onClick={handleSaveAndRestart}
            >
              Save Score & Play Again
            </button>
            <button
              className="w-full py-3 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors"
              onClick={onViewLeaderboard}
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
