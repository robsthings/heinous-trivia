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
            <div style={{
              color: '#9ca3af',
              padding: 'clamp(1.5rem, 6vw, 2rem) 0',
              textAlign: 'center'
            }}>
              <div style={{
                position: 'relative',
                margin: '0 auto',
                marginBottom: 'clamp(0.75rem, 3vw, 1rem)',
                width: 'clamp(3rem, 8vw, 4rem)',
                height: 'clamp(3rem, 8vw, 4rem)'
              }}>
                {/* Spinning skull animation */}
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0, bottom: 0, left: 0,
                  animation: 'spin 1s linear infinite'
                }}>
                  <div style={{
                    width: 'clamp(3rem, 8vw, 4rem)',
                    height: 'clamp(3rem, 8vw, 4rem)',
                    color: '#f97316',
                    fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>💀</div>
                </div>
                {/* Pulsing aura effect */}
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0, bottom: 0, left: 0,
                  animation: 'pulse 2s infinite',
                  backgroundColor: 'rgba(249, 115, 22, 0.2)',
                  borderRadius: '50%',
                  filter: 'blur(4px)'
                }}></div>
              </div>
              <p style={{
                animation: 'pulse 2s infinite',
                color: '#fb923c',
                fontFamily: '"Creepster", cursive',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>Summoning the spirits...</p>
              <p style={{
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                color: '#6b7280',
                animation: 'pulse 2s infinite'
              }}>The dead are revealing their scores</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{
              color: '#9ca3af',
              padding: 'clamp(1.5rem, 6vw, 2rem) 0',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>No scores recorded yet.</p>
              <p style={{
                fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                marginTop: '0.5rem'
              }}>Be the first to join the Hall of Horror!</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={`${entry.name}-${entry.date}`}
                style={{
                  padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                  backgroundColor: '#1f2937',
                  borderRadius: '0.5rem',
                  border: '1px solid #581c87',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                  minWidth: 0,
                  flex: 1
                }}>
                  <div style={{
                    width: 'clamp(1.5rem, 4vw, 2rem)',
                    height: 'clamp(1.5rem, 4vw, 2rem)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    backgroundColor: getRankColor(index)
                  }}>
                    <span>{index + 1}</span>
                  </div>
                  <div style={{
                    textAlign: 'left',
                    minWidth: 0,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <span style={{
                      fontWeight: '500',
                      color: '#ffffff',
                      display: 'block',
                      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{getDisplayName(entry.name)}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      {entry.correctAnswers}/{entry.questionsAnswered} correct
                    </span>
                  </div>
                </div>
                <div style={{
                  color: '#f97316',
                  fontWeight: 'bold',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  flexShrink: 0,
                  marginLeft: '0.5rem',
                  display: 'flex'
                }}>{entry.score}</div>
              </div>
            ))
          )}
        </div>

        <div style={{
          flexShrink: 0,
          display: 'flex',
          textAlign: 'center'
        }}>
          <button
            style={{
              padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 6vw, 2rem)',
              borderRadius: '0.5rem',
              fontWeight: '500',
              color: '#ffffff',
              fontSize: 'clamp(0.875rem, 3vw, 1rem)',
              background: 'linear-gradient(to right, #991b1b, #7c3aed)',
              border: '1px solid #dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
