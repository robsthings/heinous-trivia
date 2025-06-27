import { useState, useEffect } from "react";
import type { GameState } from "@/lib/gameState";
import type { LeaderboardEntry, HauntConfig } from "@shared/schema";
import { SidequestTransition } from "./SidequestTransition";

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
  const [showSidequestTransition, setShowSidequestTransition] = useState(false);
  const [hauntConfig, setHauntConfig] = useState<HauntConfig | null>(null);

  // Fetch haunt configuration
  const fetchHauntConfig = async () => {
    if (!gameState.currentHaunt) return;
    
    try {
      const response = await fetch(`/api/haunt-config/${gameState.currentHaunt}`);
      if (response.ok) {
        const config: HauntConfig = await response.json();
        setHauntConfig(config);
      }
    } catch (error) {
      console.error('Failed to fetch haunt config:', error);
    }
  };

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

  // Fetch leaderboard data and haunt config when component mounts
  useEffect(() => {
    fetchLeaderboard();
    fetchHauntConfig();
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
    <div style={{
      position: "fixed", 
      top: 0, 
      right: 0, 
      bottom: 0, 
      left: 0, 
      background: 'linear-gradient(135deg, #1c0b2e 0%, #2e003e 50%, #000000 100%)', 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "clamp(1rem, 4vw, 2rem)", 
      zIndex: 50
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '1rem',
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        padding: 'clamp(1.5rem, 5vw, 2rem)',
        maxWidth: 'clamp(22rem, 90vw, 26rem)',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: 'clamp(1.5rem, 5vw, 2rem)' }}>
          {gameState.hauntConfig?.logoPath && (
            <img 
              src={gameState.hauntConfig.logoPath} 
              alt={gameState.hauntConfig.name || "Haunt Logo"}
              style={{
                width: 'clamp(3rem, 12vw, 4rem)',
                height: 'clamp(3rem, 12vw, 4rem)',
                margin: '0 auto 1rem',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))'
              }}
            />
          )}
          <h2 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            color: '#8b5cf6',
            margin: '0 0 0.5rem 0',
            fontFamily: '"Creepster", cursive',
            textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            letterSpacing: '0.05em'
          }}>GAME COMPLETE</h2>
          <p style={{
            color: '#a78bfa',
            margin: 0,
            fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
            opacity: 0.9
          }}>Dr. Heinous reviews your performance...</p>
        </div>

        {/* Score Display */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(88, 28, 135, 0.3) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '0.75rem',
          padding: 'clamp(1rem, 4vw, 1.5rem)',
          marginBottom: 'clamp(1.5rem, 5vw, 2rem)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 'bold',
            color: '#f3f4f6',
            margin: '0 0 0.25rem 0',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
          }}>{gameState.score}</div>
          <div style={{
            color: '#d1d5db',
            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
            margin: '0 0 0.5rem 0',
            fontWeight: '500'
          }}>Final Score</div>
          <div style={{
            fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
            color: '#a78bfa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}>
            <span style={{ fontWeight: '600' }}>{gameState.correctAnswers}</span>
            <span>of</span>
            <span style={{ fontWeight: '600' }}>{gameState.questionsAnswered}</span>
            <span>correct</span>
          </div>
          {playerRank && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
              color: '#fbbf24',
              fontWeight: '600'
            }}>
              Rank #{playerRank}
            </div>
          )}
        </div>

        {/* Player Name Section */}
        {savedPlayerName ? (
          <div style={{
            marginBottom: 'clamp(1.5rem, 5vw, 2rem)',
            padding: '1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
              color: '#86efac',
              margin: '0 0 0.25rem 0'
            }}>Playing as:</div>
            <div style={{
              color: '#ffffff',
              fontWeight: '600',
              fontSize: 'clamp(1rem, 3vw, 1.125rem)'
            }}>{savedPlayerName}</div>
          </div>
        ) : (
          <div style={{ marginBottom: 'clamp(1.5rem, 5vw, 2rem)' }}>
            <input
              type="text"
              placeholder="Enter name for leaderboard"
              style={{
                width: '100%',
                padding: 'clamp(0.75rem, 3vw, 1rem)',
                borderRadius: '0.5rem',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                color: '#f3f4f6',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                outline: 'none',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(0.75rem, 3vw, 1rem)',
          marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
        }}>
          {/* Primary Action Button */}
          {!scoreSaved && (savedPlayerName || playerName.trim()) && (
            <button
              style={{
                gridColumn: '1 / -1',
                padding: 'clamp(0.75rem, 3vw, 1rem)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                color: '#ffffff',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onClick={handleSaveAndViewLeaderboard}
              disabled={isSaving}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isSaving ? 'Saving Score...' : 'Save & View Leaderboard'}
            </button>
          )}

          {scoreSaved && (
            <button
              style={{
                gridColumn: '1 / -1',
                padding: 'clamp(0.75rem, 3vw, 1rem)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                color: '#ffffff',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onClick={onViewLeaderboard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View Leaderboard
            </button>
          )}

          {/* Play Again Button */}
          <button
            style={{
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: '0.5rem',
              fontWeight: '500',
              color: '#d1d5db',
              fontSize: 'clamp(0.875rem, 3vw, 1rem)',
              background: 'rgba(75, 85, 99, 0.3)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onClick={handlePlayAgain}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(75, 85, 99, 0.5)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)';
              e.currentTarget.style.color = '#d1d5db';
            }}
          >
            Play Again
          </button>

          {/* Sidequest Button */}
          <button
            style={{
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: '0.5rem',
              fontWeight: '500',
              color: '#ffffff',
              fontSize: 'clamp(0.875rem, 3vw, 1rem)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onClick={() => setShowSidequestTransition(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔮 Sidequest
          </button>
        </div>

        {/* View Only Leaderboard (when score not saved) */}
        {!scoreSaved && !savedPlayerName && !playerName.trim() && (
          <button
            style={{
              width: '100%',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: '0.5rem',
              fontWeight: '500',
              color: '#9ca3af',
              fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
              background: 'transparent',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onClick={onViewLeaderboard}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#d1d5db';
              e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
            }}
          >
            View Leaderboard Only
          </button>
        )}
      </div>
      
      {/* Sidequest Transition Overlay */}
      {showSidequestTransition && (
        <SidequestTransition 
          hauntConfig={hauntConfig} 
          onComplete={() => setShowSidequestTransition(false)}
        />
      )}
    </div>
  );
}
