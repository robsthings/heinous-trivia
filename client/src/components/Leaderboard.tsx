/**
 * FIREBASE FIELD NAME REFERENCE: Check /fieldGlossary.json before modifying any Firebase operations
 * - Use 'haunt' for query parameters, 'hauntId' for Firebase document fields
 * - Use 'action' for ad interactions (NOT 'interactionType')
 * - Collections: game_sessions, ad_interactions (snake_case), haunt-ads (kebab-case)
 * - Verify all field names against canonical glossary before changes
 */
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

  // Individual mode only - no hidden player polling needed
  // Removed group mode hidden player polling logic

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
        return "#7f1d1d"; // bg-red-900
      case 1:
        return "#581c87"; // bg-purple-900
      case 2:
        return "#581c87"; // bg-purple-900
      default:
        return "#4b5563"; // bg-gray-600
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(0.75rem, 3vw, 1rem)',
      zIndex: 50
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '0.75rem',
        boxShadow: '0 0 12px rgba(255, 0, 50, 0.1)',
        backdropFilter: 'blur(6px)',
        animation: 'fade-in 0.5s ease-out',
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        maxWidth: 'clamp(24rem, 90vw, 28rem)',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(1rem, 4vw, 1.5rem)'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            color: '#f97316',
            fontFamily: '"Creepster", cursive',
            marginBottom: '0.5rem'
          }}>Hall of Horror</h2>
          <p style={{
            color: '#d1d5db',
            fontSize: 'clamp(0.875rem, 3vw, 1rem)'
          }}>Top 10 Nightmare Navigators</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.5rem, 2vw, 0.75rem)',
          marginBottom: 'clamp(1rem, 4vw, 1.5rem)',
          flex: '1',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div className=" text-gray-400 py-6 sm:py-8" className="text-center">
              <div style={{
                position: 'relative',
                margin: '0 auto',
                marginBottom: 'clamp(0.75rem, 3vw, 1rem)',
                width: 'clamp(3rem, 8vw, 4rem)',
                height: 'clamp(3rem, 8vw, 4rem)'
              }}>
                {/* Spinning skull animation */}
                <div className="absolute inset-0 animate-spin">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 text-2xl sm:text-4xl   justify-center" style={{alignItems: "center"}} style={{display: "flex"}}>💀</div>
                </div>
                {/* Pulsing aura effect */}
                <div className="absolute inset-0 animate-pulse bg-orange-500/20 rounded-full blur-sm"></div>
              </div>
              <p className="animate-pulse text-orange-400 creepster text-sm sm:text-base">Summoning the spirits...</p>
              <p className="text-xs mt-2 text-gray-500 animate-pulse">The dead are revealing their scores</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className=" text-gray-400 py-6 sm:py-8" className="text-center">
              <p className="text-sm sm:text-base">No scores recorded yet.</p>
              <p className="text-xs sm:text-sm mt-2">Be the first to join the Hall of Horror!</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={`${entry.name}-${entry.date}`}
                className="   p-2 sm:p-3 bg-gray-800 rounded-lg border border-purple-900" style={{justifyContent: "space-between"}} style={{alignItems: "center"}} style={{display: "flex"}}
              >
                <div className="flex  space-x-2 sm:space-x-3 min-w-0 -1" style={{alignItems: "center"}} style={{display: "flex"}}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${getRankColor(index)}`}>
                    <span>{index + 1}</span>
                  </div>
                  <div className="text-left min-w-0 -1" style={{display: "flex"}}>
                    <span className="font-medium text-white block text-sm sm:text-base truncate">{getDisplayName(entry.name)}</span>
                    <span className="text-xs text-gray-400">
                      {entry.correctAnswers}/{entry.questionsAnswered} correct
                    </span>
                  </div>
                </div>
                <div className="text-orange-500 font-bold text-sm sm:text-base -shrink-0 ml-2" style={{display: "flex"}}>{entry.score}</div>
              </div>
            ))
          )}
        </div>

        <div className=" -shrink-0" style={{display: "flex"}} className="text-center">
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
