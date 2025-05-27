import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { TriviaCard } from "@/components/TriviaCard";
import { InterstitialAd } from "@/components/InterstitialAd";
import { GameEndScreen } from "@/components/GameEndScreen";
import { Leaderboard } from "@/components/Leaderboard";
import { ConfigLoader, getHauntFromURL } from "@/lib/configLoader";
import { GameManager, type GameState } from "@/lib/gameState";
import { firestore } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import type { LeaderboardEntry, TriviaQuestion } from "@shared/schema";

interface ActiveRound {
  questionIndex: number;
  question: TriviaQuestion;
  status: "countdown" | "live" | "reveal" | "waiting";
  startTime: number;
  currentAnswers: Record<string, string>;
  totalQuestions: number;
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(() => 
    GameManager.createInitialState(getHauntFromURL())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeRound, setActiveRound] = useState<ActiveRound | null>(null);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [playerId, setPlayerId] = useState<string>(() => 
    localStorage.getItem(`heinous-player-${getHauntFromURL()}`) || ""
  );
  const [playerName, setPlayerName] = useState<string>(() => 
    localStorage.getItem(`heinous-player-name-${getHauntFromURL()}`) || ""
  );
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState("");
  const [groupAnswer, setGroupAnswer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

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

        // Check if haunt is configured for group mode
        if (hauntConfig?.mode === "queue") {
          setIsGroupMode(true);
        }

        // Initialize player if needed
        if (!playerId || !playerName) {
          setShowNamePrompt(true);
        }
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

  const savePlayerInfo = (name: string) => {
    const newPlayerId = playerId || `player_${Math.random().toString(36).substr(2, 9)}`;
    const haunt = gameState.currentHaunt;
    
    // Save to localStorage for persistence
    localStorage.setItem(`heinous-player-${haunt}`, newPlayerId);
    localStorage.setItem(`heinous-player-name-${haunt}`, name);
    
    setPlayerId(newPlayerId);
    setPlayerName(name);
    setShowNamePrompt(false);
    setTempName("");
  };

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

  const handleSaveScore = async (inputPlayerName?: string) => {
    const nameToUse = inputPlayerName || playerName;
    await GameManager.saveScore(nameToUse, gameState);
    const updatedLeaderboard = await GameManager.getLeaderboard(gameState.currentHaunt);
    setLeaderboard(updatedLeaderboard);
  };

  const handlePlayAgain = () => {
    setGameState(prev => GameManager.playAgain(prev));
  };

  const handleViewLeaderboard = async () => {
    const leaderboardData = await GameManager.getLeaderboard();
    setLeaderboard(leaderboardData);
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

  // Nickname Prompt Component
  const NicknamePrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-black/90 border-red-600 text-white max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-red-500 flex items-center justify-center gap-2">
            {isGroupMode ? <Users className="h-6 w-6" /> : <User className="h-6 w-6" />}
            {isGroupMode ? "Join Group Game" : "Create Your Player Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-300 text-sm">
            {isGroupMode 
              ? "Choose a name that other players will see during the group trivia session."
              : "Choose a nickname for the leaderboard. Your name will be saved for future games."
            }
          </div>
          
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={isGroupMode ? "Your group name..." : "Your nickname..."}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              maxLength={20}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tempName.trim()) {
                  e.preventDefault();
                  savePlayerInfo(tempName.trim());
                }
              }}
            />
            <div className="text-xs text-gray-400 text-right">
              {tempName.length}/20 characters
            </div>
          </div>

          <Button 
            type="button"
            onClick={() => savePlayerInfo(tempName.trim())}
            disabled={!tempName.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isGroupMode ? "Join Game" : "Start Playing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (showNamePrompt) {
    return <NicknamePrompt />;
  }

  return (
    <div className="min-h-screen">
      <GameHeader gameState={gameState} />
      
      <main className="p-4">
        {isGroupMode && !activeRound ? (
          <Card className="bg-gray-900/50 border-gray-700 text-white max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-400 flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Group Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-gray-300">
                Welcome, <span className="text-white font-bold">{playerName}</span>!
              </div>
              <div className="text-yellow-400 text-lg">
                Waiting for host to start the game...
              </div>
              <div className="text-gray-400 text-sm">
                The host will control when questions begin. Get ready for synchronized trivia fun!
              </div>
            </CardContent>
          </Card>
        ) : (
          <TriviaCard
            gameState={gameState}
            onSelectAnswer={handleSelectAnswer}
            onNextQuestion={handleNextQuestion}
          />
        )}
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
        playerName={playerName}
      />

      <Leaderboard
        isVisible={gameState.showLeaderboard}
        leaderboard={leaderboard}
        onClose={handleCloseLeaderboard}
        hauntId={gameState.currentHaunt}
        currentPlayer={playerId}
      />
    </div>
  );
}
