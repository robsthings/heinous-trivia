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
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '0.75rem',
        boxShadow: '0 0 12px rgba(255, 0, 50, 0.1)',
        backdropFilter: 'blur(6px)',
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        maxWidth: 'clamp(24rem, 90vw, 28rem)',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'fade-in 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* Haunt Logo */}
          {gameState.hauntConfig?.logoPath && (
            <div style={{ marginBottom: '1.5rem' }}>
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
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            color: '#f97316',
            marginBottom: '0.5rem',
            fontFamily: '"Creepster", cursive'
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
            <div style={{
              marginBottom: 'clamp(1rem, 4vw, 1.5rem)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}>Playing as:</div>
              <div style={{
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: 'clamp(1rem, 3vw, 1.125rem)'
              }}>{savedPlayerName}</div>
              <div style={{
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                color: '#9ca3af'
              }}>Score will be saved automatically</div>
            </div>
          ) : (
            <div style={{
              marginBottom: 'clamp(1rem, 4vw, 1.5rem)'
            }}>
              <input
                type="text"
                placeholder="Enter your name for the leaderboard"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #7f1d1d',
                  color: '#ffffff',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  outline: 'none'
                }}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#7f1d1d'}
              />
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(0.5rem, 2vw, 0.75rem)'
          }}>
            {!scoreSaved && !savedPlayerName && (
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  background: 'linear-gradient(to right, #991b1b, #7c3aed)',
                  border: '1px solid #dc2626',
                  cursor: isSaving || !playerName.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSaving || !playerName.trim() ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onClick={handleSaveAndViewLeaderboard}
                disabled={isSaving || !playerName.trim()}
                onMouseEnter={(e) => {
                  if (!isSaving && playerName.trim()) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSaving ? 'Saving...' : 'Save Score & View Leaderboard'}
              </button>
            )}
            
            {!scoreSaved && savedPlayerName && (
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  background: 'linear-gradient(to right, #991b1b, #7c3aed)',
                  border: '1px solid #dc2626',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onClick={handleSaveAndViewLeaderboard}
                disabled={isSaving}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSaving ? 'Saving...' : 'Save Score & View Leaderboard'}
              </button>
            )}

            {scoreSaved && (
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  background: 'linear-gradient(to right, #991b1b, #7c3aed)',
                  border: '1px solid #dc2626',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={onViewLeaderboard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                View Full Leaderboard
              </button>
            )}
            
            <button
              style={{
                width: '100%',
                padding: 'clamp(0.75rem, 3vw, 1rem)',
                borderRadius: '0.5rem',
                fontWeight: '500',
                color: '#d1d5db',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                background: 'transparent',
                border: '1px solid #4b5563',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={handlePlayAgain}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Play Again
            </button>
            
            <button
              style={{
                width: '100%',
                padding: 'clamp(0.75rem, 3vw, 1rem)',
                borderRadius: '0.5rem',
                fontWeight: '500',
                color: '#ffffff',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                background: 'linear-gradient(to right, #6b46c1, #7c3aed)',
                border: '1px solid #8b5cf6',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                // Placeholder for future sidequest serving implementation
                alert('Sidequest summoning coming soon! Dr. Heinous is preparing his supernatural challenges...');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #8b5cf6)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #6b46c1, #7c3aed)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🔮 Summon Sidequest
            </button>
            
            {!scoreSaved && (
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  background: 'transparent',
                  border: '1px solid #4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={onViewLeaderboard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
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
