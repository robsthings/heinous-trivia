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
    <header className="glass-card mx-3 sm:mx-4 mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border-red-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {hauntConfig && (
            <img
              src={hauntConfig.logoPath}
              alt={`${hauntConfig.name} Logo`}
              className={`${hauntConfig.tier === 'premium' ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full border-2 flex-shrink-0`}
              style={{ borderColor: primaryColor }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 
              className={`font-creepster truncate ${hauntConfig?.tier === 'premium' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}
              style={{ color: accentColor }}
            >
              {hauntConfig?.name || 'Loading...'}
            </h1>
            {hauntConfig?.tier !== 'premium' && (
              <p className="text-xs sm:text-sm text-gray-300 opacity-75">Hosted by Dr. Heinous</p>
            )}
            {hauntConfig?.tier === 'premium' && (
              <p className="text-xs sm:text-sm text-gray-300 opacity-75">Premium Experience</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div 
            className="text-xl sm:text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {isGroupMode ? groupScore : score}
          </div>
          <div className="text-xs sm:text-sm text-gray-300">Score</div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="flex justify-between text-xs sm:text-sm text-gray-300 mb-2">
          <span className="truncate mr-2">
            Q {currentQuestionDisplay}/{totalQuestions} • {correctAnswers}/{questionsAnswered} correct
          </span>
          <span className="flex-shrink-0">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-black rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: getProgressBarGradient(gameState.hauntConfig)
            }}
          />
        </div>
      </div>
    </header>
  );
}
