import type { GameState } from "@/lib/gameState";
import type { HauntConfig } from "@shared/schema";

interface GameHeaderProps {
  gameState: GameState;
  isGroupMode?: boolean;
  groupScore?: number;
}

// Function to get progress bar gradient based on haunt config
function getProgressBarGradient(hauntConfig: HauntConfig | null | undefined): string {
  // Check if haunt is eligible for custom progress bar themes (Pro/Premium only)
  const isPremiumTier = hauntConfig?.tier === 'pro' || hauntConfig?.tier === 'premium';
  const hasCustomTheme = isPremiumTier && hauntConfig?.progressBarTheme;

  if (hasCustomTheme && hauntConfig.progressBarTheme) {
    const themes = {
      'crimson': 'linear-gradient(to right, #dc2626, #f87171)',
      'blood': 'linear-gradient(to right, #991b1b, #dc2626)',
      'electric': 'linear-gradient(to right, #3b82f6, #22d3ee)',
      'toxic': 'linear-gradient(to right, #10b981, #84cc16)',
      'purple': 'linear-gradient(to right, #9333ea, #a855f7)',
      'orange': 'linear-gradient(to right, #ea580c, #fb923c)',
      'pink': 'linear-gradient(to right, #ec4899, #fb7185)',
      'gold': 'linear-gradient(to right, #eab308, #f59e0b)'
    };
    return themes[hauntConfig.progressBarTheme as keyof typeof themes] || themes.crimson;
  }

  // Default gradient for Basic tier or haunts without custom theme
  const primaryColor = hauntConfig?.theme?.primaryColor || '#8B0000';
  const accentColor = hauntConfig?.theme?.accentColor || '#FF6B35';
  return `linear-gradient(to right, ${primaryColor}, ${accentColor})`;
}

export function GameHeader({ gameState, isGroupMode = false, groupScore = 0 }: GameHeaderProps) {
  const { hauntConfig, score, currentQuestionIndex, questionsAnswered, correctAnswers } = gameState;
  
  // Get theme colors from haunt config
  const primaryColor = gameState.hauntConfig?.theme?.primaryColor || '#8B0000';
  const secondaryColor = gameState.hauntConfig?.theme?.secondaryColor || '#2D1B69';
  const accentColor = gameState.hauntConfig?.theme?.accentColor || '#FF6B35';
  
  const totalQuestions = 20; // Full trivia session
  // Use currentQuestionIndex + 1 for current position, questionsAnswered for progress
  const currentQuestionDisplay = currentQuestionIndex + 1;
  const progress = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;

  return (
    <header style={{
      background: 'rgba(31, 41, 55, 0.9)',
      border: '1px solid rgba(75, 85, 99, 0.6)',
      margin: '16px',
      marginTop: '16px',
      padding: '16px',
      borderRadius: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          {hauntConfig && (
            <img
              src={hauntConfig.logoPath}
              alt={`${hauntConfig.name} Logo`}
              style={{
                width: hauntConfig.tier === 'premium' ? '64px' : '48px',
                height: hauntConfig.tier === 'premium' ? '64px' : '48px',
                borderRadius: '50%',
                border: `2px solid ${primaryColor}`,
                flexShrink: 0
              }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {hauntConfig?.name || 'Loading...'}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Horror Trivia Challenge</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {isGroupMode ? groupScore : score}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>Score</div>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px',
          color: '#d1d5db',
          marginBottom: '8px'
        }}>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: '8px'
          }}>
            Q {currentQuestionDisplay}/{totalQuestions} • {correctAnswers}/{questionsAnswered} correct
          </span>
          <span style={{ flexShrink: 0 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#374151',
          borderRadius: '9999px',
          height: '12px'
        }}>
          <div
            style={{
              height: '12px',
              borderRadius: '9999px',
              transition: 'all 0.3s ease',
              background: getProgressBarGradient(hauntConfig),
              width: `${progress}%`
            }}
          />
        </div>
      </div>
    </header>
  );
}
