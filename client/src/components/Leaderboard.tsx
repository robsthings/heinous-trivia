import { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
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

  // Listen for hidden player changes from the host panel
  useEffect(() => {
    if (!hauntId) return;

    const roundRef = doc(firestore, 'activeRound', hauntId);
    const unsubscribe = onSnapshot(roundRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setHiddenPlayers(data.hiddenPlayers || {});
      }
    });

    return () => unsubscribe();
  }, [hauntId]);

  const getDisplayName = (playerName: string) => {
    // Always show the current player their own name
    if (playerName === currentPlayer) {
      return playerName;
    }
    
    // Hide other players' names if they're marked as hidden
    if (hiddenPlayers[playerName]) {
      const playerId = Math.abs(playerName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 9999;
      return `Player ${String(playerId).padStart(4, '0')}`;
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
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-xl p-6 max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="font-creepster text-3xl text-orange-500 mb-2">Hall of Horror</h2>
          <p className="text-gray-300">Top 10 Nightmare Navigators</p>
        </div>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="relative mx-auto mb-4 w-16 h-16">
                {/* Spinning skull animation */}
                <div className="absolute inset-0 animate-spin">
                  <div className="w-16 h-16 text-orange-500 text-4xl flex items-center justify-center">💀</div>
                </div>
                {/* Pulsing aura effect */}
                <div className="absolute inset-0 animate-pulse bg-orange-500/20 rounded-full blur-sm"></div>
              </div>
              <p className="animate-pulse text-orange-400 font-creepster">Summoning the spirits...</p>
              <p className="text-xs mt-2 text-gray-500 animate-pulse">The dead are revealing their scores</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No scores recorded yet.</p>
              <p className="text-sm mt-2">Be the first to join the Hall of Horror!</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={`${entry.name}-${entry.date}`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-purple-900"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(index)}`}>
                    <span>{index + 1}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-white block">{getDisplayName(entry.name)}</span>
                    <span className="text-xs text-gray-400">
                      {entry.correctAnswers}/{entry.questionsAnswered} correct
                    </span>
                  </div>
                </div>
                <div className="text-orange-500 font-bold">{entry.score}</div>
              </div>
            ))
          )}
        </div>

        <div className="text-center">
          <button
            className="horror-button px-8 py-3 rounded-lg font-medium text-white"
            onClick={onClose}
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
