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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!gameState.showEndScreen || !gameState.currentHaunt) return;
    
    try {
      setIsLoadingLeaderboard(true);
      const response = await fetch(`/api/leaderboard/${gameState.currentHaunt}`);
      
      if (response.ok) {
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data);
        
        // Calculate player's rank if they have a saved name and score
        const currentPlayerName = savedPlayerName || playerName.trim();
        if (currentPlayerName) {
          const playerPosition = data.findIndex(entry => 
            entry.name === currentPlayerName && entry.score === gameState.score
          );
          if (playerPosition !== -1) {
            setPlayerRank(playerPosition + 1);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Fetch leaderboard data when component mounts
  useEffect(() => {
    fetchLeaderboard();
  }, [gameState.showEndScreen, gameState.currentHaunt, savedPlayerName, gameState.score]);

  if (!gameState.showEndScreen) {
    return null;
  }

  const handleSaveAndViewLeaderboard = async () => {
    if (scoreSaved) return; // Prevent duplicate saves
    
    setIsSaving(true);
    try {
      // Save score if we have a name
      if (savedPlayerName) {
        await onSaveScore();
      } else if (playerName.trim()) {
        await onSaveScore(playerName.trim());
      }
      
      setScoreSaved(true);
      
      // Refresh leaderboard after saving
      await fetchLeaderboard();
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!scoreSaved) {
      if (savedPlayerName) {
        await onSaveScore();
      } else if (playerName.trim()) {
        await onSaveScore(playerName.trim());
      }
    }
    onPlayAgain();
  };

  return (
    <div style={{position: "fixed", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0, 0, 0, 0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(0.75rem, 3vw, 1rem)", zIndex: 50}}>
      <div className="glass-card animate-fade-in" style={{
        borderRadius: '0.75rem',
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        maxWidth: 'clamp(24rem, 90vw, 28rem)',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{textAlign: "center"}}>
          {/* Haunt Logo */}
          {gameState.hauntConfig?.logoPath && (
            <div style={{marginBottom: "1.5rem"}}>
              <img 
                src={gameState.hauntConfig.logoPath} 
                alt={gameState.hauntConfig.name || "Haunt Logo"}
                style={{
                  width: '6rem',
                  height: '6rem',
                  margin: '0 auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
          <h2 className="creepster" style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            color: '#f97316',
            marginBottom: '0.5rem'
          }}>Game Over</h2>
          <p style={{
            color: '#d1d5db',
            marginBottom: 'clamp(1rem, 4vw, 1.5rem)',
            fontSize: 'clamp(0.875rem, 3vw, 1rem)'
          }}>Dr. Heinous is pleased with your performance...</p>
          
          <div style={{
            backgroundColor: '#581c87',
            borderRadius: '0.5rem',
            padding: 'clamp(1rem, 4vw, 1.5rem)',
            marginBottom: 'clamp(1rem, 4vw, 1.5rem)'
          }}>
            <div style={{
              fontSize: 'clamp(1.875rem, 5vw, 2.25rem)',
              fontWeight: 'bold',
              color: '#f97316',
              marginBottom: '0.5rem'
            }}>{gameState.score}</div>
            <div style={{
              color: 'white',
              fontSize: 'clamp(0.875rem, 3vw, 1rem)'
            }}>Final Score</div>
            <div style={{
              fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
              color: '#d1d5db',
              marginTop: '0.5rem'
            }}>
              <span>{gameState.correctAnswers}</span> of{" "}
              <span>{gameState.questionsAnswered}</span> correct
            </div>
            {playerRank && (
              <div className="text-orange-400 text-sm font-bold mt-2">
                Rank #{playerRank}
              </div>
            )}
          </div>



          {savedPlayerName ? (
            <div className="mb-4 sm: " style={{marginBottom: "1.5rem"}} style={{textAlign: "center"}}>
              <div className="text-gray-300 text-xs sm:text-sm mb-2">Playing as:</div>
              <div className="text-white font-bold text-base sm:text-lg">{savedPlayerName}</div>
              <div className="text-gray-400 text-xs mt-1">Score will be saved automatically</div>
            </div>
          ) : (
            <div className="mb-4 sm:" style={{marginBottom: "1.5rem"}}>
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
            {!scoreSaved && !savedPlayerName && (
              <button
                className={`horror-button w-full py-3 sm:py-4 rounded-lg font-medium text-white text-sm sm:text-base touch-manipulation ${
                  isSaving || !playerName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleSaveAndViewLeaderboard}
                disabled={isSaving || !playerName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Score & View Leaderboard'}
              </button>
            )}
            
            {!scoreSaved && savedPlayerName && (
              <button
                className={`horror-button w-full py-3 sm:py-4 rounded-lg font-medium text-white text-sm sm:text-base touch-manipulation ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleSaveAndViewLeaderboard}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Score & View Leaderboard'}
              </button>
            )}

            {scoreSaved && (
              <button
                className="horror-button w-full py-3 sm:py-4 rounded-lg font-medium text-white text-sm sm:text-base touch-manipulation"
                onClick={onViewLeaderboard}
              >
                View Full Leaderboard
              </button>
            )}
            
            <button
              className="w-full py-3 sm:py-4 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors text-sm sm:text-base touch-manipulation"
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
            
            {!scoreSaved && (
              <button
                className="w-full py-3 sm:py-4 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors text-sm sm:text-base touch-manipulation"
                onClick={onViewLeaderboard}
              >
                View Leaderboard Only
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
