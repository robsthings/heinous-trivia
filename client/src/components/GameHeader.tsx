import type { GameState } from "@/lib/gameState";

interface GameHeaderProps {
  gameState: GameState;
}

export function GameHeader({ gameState }: GameHeaderProps) {
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
    <header className="glass-card mx-4 mt-4 p-4 rounded-lg border-red-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {hauntConfig && (
            <img
              src={hauntConfig.logoPath}
              alt={`${hauntConfig.name} Logo`}
              className="w-12 h-12 rounded-full border-2"
              style={{ borderColor: primaryColor }}
            />
          )}
          <div>
            <h1 
              className="font-creepster text-xl"
              style={{ color: accentColor }}
            >
              {hauntConfig?.name || 'Loading...'}
            </h1>
            <p className="text-sm text-gray-300 opacity-75">Hosted by Dr. Heinous</p>
          </div>
        </div>
        <div className="text-right">
          <div 
            className="text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {score}
          </div>
          <div className="text-sm text-gray-300">Score</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>
            Question {currentQuestionDisplay} of {totalQuestions} • {correctAnswers}/{questionsAnswered} correct
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-black rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`
            }}
          />
        </div>
      </div>
    </header>
  );
}
