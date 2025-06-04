import { useState, useEffect } from "react";
import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardProps {
  isVisible: boolean;
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
  hauntId?: string;
  currentPlayer?: string;
  isLoading?: boolean;
}

export function Leaderboard({ isVisible, leaderboard, onClose, hauntId, currentPlayer, isLoading = false }: LeaderboardProps) {
  const [hiddenPlayers, setHiddenPlayers] = useState<Record<string, boolean>>({});
  
  // Debug logging to track leaderboard updates
  console.log('Leaderboard component render - isVisible:', isVisible, 'entries:', leaderboard.length, 'hauntId:', hauntId);

  // Poll for hidden player changes from server instead of direct Firestore
  useEffect(() => {
    if (!hauntId) return;

    const pollHiddenPlayers = async () => {
      try {
        const response = await fetch(`/api/host/${hauntId}/round`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.hiddenPlayers) {
            setHiddenPlayers(data.hiddenPlayers);
          }
        }
      } catch (error) {
        console.error('Error fetching hidden players:', error);
      }
    };

    pollHiddenPlayers();
    const interval = setInterval(pollHiddenPlayers, 5000);
    return () => clearInterval(interval);
  }, [hauntId]);

  const getDisplayName = (playerName: string) => {
    // Always show the current player their own name
    if (playerName === currentPlayer) {
      return playerName;
    }
    
    // Hide other players' names if they're marked as hidden - show ##### instead
    if (hiddenPlayers[playerName]) {
      return "#####";
    }
    
    return playerName;
  };

  if (!isVisible) {
    return null;
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-red-900";
      case 1:
        return "bg-purple-900";
      case 2:
        return "bg-purple-900";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="glass-card rounded-xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full animate-fade-in max-h-[90vh] overflow-hidden flex flex-col">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="font-creepster text-2xl sm:text-3xl text-orange-500 mb-2">Hall of Horror</h2>
          <p className="text-gray-300 text-sm sm:text-base">Top 10 Nightmare Navigators</p>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-gray-400 py-6 sm:py-8">
              <div className="relative mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16">
                {/* Spinning skull animation */}
                <div className="absolute inset-0 animate-spin">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 text-2xl sm:text-4xl flex items-center justify-center">💀</div>
                </div>
                {/* Pulsing aura effect */}
                <div className="absolute inset-0 animate-pulse bg-orange-500/20 rounded-full blur-sm"></div>
              </div>
              <p className="animate-pulse text-orange-400 font-creepster text-sm sm:text-base">Summoning the spirits...</p>
              <p className="text-xs mt-2 text-gray-500 animate-pulse">The dead are revealing their scores</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-6 sm:py-8">
              <p className="text-sm sm:text-base">No scores recorded yet.</p>
              <p className="text-xs sm:text-sm mt-2">Be the first to join the Hall of Horror!</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={`${entry.name}-${entry.date}`}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-800 rounded-lg border border-purple-900"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${getRankColor(index)}`}>
                    <span>{index + 1}</span>
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className="font-medium text-white block text-sm sm:text-base truncate">{getDisplayName(entry.name)}</span>
                    <span className="text-xs text-gray-400">
                      {entry.correctAnswers}/{entry.questionsAnswered} correct
                    </span>
                  </div>
                </div>
                <div className="text-orange-500 font-bold text-sm sm:text-base flex-shrink-0 ml-2">{entry.score}</div>
              </div>
            ))
          )}
        </div>

        <div className="text-center flex-shrink-0">
          <button
            className="horror-button px-6 sm:px-8 py-3 rounded-lg font-medium text-white text-sm sm:text-base touch-manipulation"
            onClick={onClose}
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
