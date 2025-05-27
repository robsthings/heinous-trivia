import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { TriviaCard } from "@/components/TriviaCard";
import { InterstitialAd } from "@/components/InterstitialAd";
import { GameEndScreen } from "@/components/GameEndScreen";
import { Leaderboard } from "@/components/Leaderboard";
import { ConfigLoader, getHauntFromURL } from "@/lib/configLoader";
import { GameManager, type GameState } from "@/lib/gameState";
import type { LeaderboardEntry } from "@shared/schema";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(() => 
    GameManager.createInitialState(getHauntFromURL())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const haunt = gameState.currentHaunt;

        // Load haunt configuration
        const hauntConfig = await ConfigLoader.loadHauntConfig(haunt);
        if (!hauntConfig) {
          throw new Error(`Haunt configuration for '${haunt}' not found`);
        }

        // Load trivia questions
        const questions = await ConfigLoader.loadTriviaQuestions(haunt);
        if (questions.length === 0) {
          throw new Error(`No trivia questions found for '${haunt}'`);
        }

        // Load ad data
        const ads = await ConfigLoader.loadAdData(haunt);

        // Shuffle questions for variety
        const shuffledQuestions = GameManager.shuffleQuestions(questions);

        setGameState(prev => ({
          ...prev,
          hauntConfig,
          questions: shuffledQuestions,
          ads,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
        setError(errorMessage);
        console.error('Game initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [gameState.currentHaunt]);

  const handleSelectAnswer = (answerIndex: number) => {
    setGameState(prev => GameManager.selectAnswer(prev, answerIndex));
  };

  const handleNextQuestion = () => {
    setGameState(prev => GameManager.nextQuestion(prev));
  };

  const handleCloseAd = () => {
    setGameState(prev => GameManager.closeAd(prev));
  };

  const handleVisitAd = (link: string) => {
    window.open(link, '_blank');
  };

  const handleSaveScore = async (playerName: string) => {
    await GameManager.saveScore(playerName, gameState);
  };

  const handlePlayAgain = () => {
    setGameState(prev => GameManager.playAgain(prev));
  };

  const handleViewLeaderboard = () => {
    setGameState(prev => ({
      ...prev,
      showLeaderboard: true,
      showEndScreen: false,
    }));
  };

  const handleCloseLeaderboard = () => {
    setGameState(prev => ({
      ...prev,
      showLeaderboard: false,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-xl p-8 text-center">
          <h2 className="font-creepster text-2xl text-orange-500 mb-4">
            Summoning the Spirits...
          </h2>
          <p className="text-gray-300">Loading your horror trivia experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-xl p-8 text-center max-w-md">
          <h2 className="font-creepster text-2xl text-red-500 mb-4">
            The Spirits Are Restless
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="horror-button px-6 py-3 rounded-lg font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GameHeader gameState={gameState} />
      
      <main className="p-4">
        <TriviaCard
          gameState={gameState}
          onSelectAnswer={handleSelectAnswer}
          onNextQuestion={handleNextQuestion}
        />
      </main>

      <InterstitialAd
        gameState={gameState}
        onClose={handleCloseAd}
        onVisitAd={handleVisitAd}
      />

      <GameEndScreen
        gameState={gameState}
        onSaveScore={handleSaveScore}
        onPlayAgain={handlePlayAgain}
        onViewLeaderboard={handleViewLeaderboard}
      />

      <Leaderboard
        isVisible={gameState.showLeaderboard}
        leaderboard={GameManager.getLeaderboard()}
        onClose={handleCloseLeaderboard}
      />
    </div>
  );
}
