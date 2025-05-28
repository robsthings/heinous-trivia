import type { GameState } from "@/lib/gameState";

interface GameHeaderProps {
  gameState: GameState;
}

export function GameHeader({ gameState }: GameHeaderProps) {
  const { hauntConfig, score, currentQuestionIndex, questionsAnswered } = gameState;
  
  // Get theme colors from haunt config
  const primaryColor = gameState.hauntConfig?.theme?.primaryColor || '#8B0000';
  const secondaryColor = gameState.hauntConfig?.theme?.secondaryColor || '#2D1B69';
  const accentColor = gameState.hauntConfig?.theme?.accentColor || '#FF6B35';
  
  const totalQuestions = Math.min(gameState.questions.length, 5);
  const progress = totalQuestions > 0 ? ((questionsAnswered % 5) / totalQuestions) * 100 : 0;
  const currentQuestionDisplay = (questionsAnswered % 5) + 1;

  return (
    <header className="glass-card mx-4 mt-4 p-4 rounded-lg border-red-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {hauntConfig && (
            <img
              src={hauntConfig.logoPath}
              alt={`${hauntConfig.name} Logo`}
              className="w-12 h-12 rounded-full border-2 border-red-900"
            />
          )}
          <div>
            <h1 className="font-creepster text-xl text-orange-500">
              {hauntConfig?.name || 'Loading...'}
            </h1>
            <p className="text-sm text-gray-300 opacity-75">Hosted by Dr. Heinous</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">{score}</div>
          <div className="text-sm text-gray-300">Score</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>
            Question {currentQuestionDisplay} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-black rounded-full h-2">
          <div
            className="bg-gradient-to-r from-red-900 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  );
}
