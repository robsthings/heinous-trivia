import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { TriviaCard } from "@/components/TriviaCard";
import { InterstitialAd } from "@/components/InterstitialAd";
import { GameEndScreen } from "@/components/GameEndScreen";
import { Leaderboard } from "@/components/Leaderboard";
import { Footer } from "@/components/Footer";
import { SpookyLoader } from "@/components/SpookyLoader";
import { MiniSpookyLoader } from "@/components/MiniSpookyLoader";
import { ConfigLoader, getHauntFromURL } from "@/lib/configLoader";
import { GameManager, type GameState } from "@/lib/gameState";
import { updateMetaThemeColor } from "@/lib/manifestGenerator";
import { firestore } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Link } from "wouter";
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
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
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
        
        // Validate haunt parameter is provided
        if (!haunt) {
          setError("No haunt specified. Please access the game with a valid haunt parameter (?haunt=yourhaunt)");
          setIsLoading(false);
          return;
        }

        // Load haunt configuration from Firebase
        const hauntConfig = await ConfigLoader.loadHauntConfig(haunt);
        if (!hauntConfig) {
          setError(`Haunt '${haunt}' not found. Please check that this haunt exists and is properly configured.`);
          setIsLoading(false);
          return;
        }

        // Load trivia questions (includes fallback to starter pack)
        const questions = await ConfigLoader.loadTriviaQuestions(haunt);
        
        // Validate questions array and format
        if (!Array.isArray(questions) || questions.length === 0) {
          setError("No trivia questions found! Please ensure the starter pack is properly configured.");
          setIsLoading(false);
          return;
        }
        
        // Validate question format to prevent crashes
        const validQuestions = questions.filter(q => 
          q && 
          q.text && 
          Array.isArray(q.answers) && 
          q.answers.length > 0 && 
          typeof q.correctAnswer === 'number' && 
          q.correctAnswer >= 0 && 
          q.correctAnswer < q.answers.length
        );
        
        if (validQuestions.length === 0) {
          setError("No valid trivia questions found! All questions have formatting issues.");
          setIsLoading(false);
          return;
        }
        
        if (validQuestions.length < questions.length) {
          console.warn(`Filtered out ${questions.length - validQuestions.length} malformed questions`);
        }

        // Load ad data
        const ads = await ConfigLoader.loadAdData(haunt);

        // Shuffle questions for variety
        const shuffledQuestions = GameManager.shuffleQuestions(validQuestions);

        setGameState(prev => ({
          ...prev,
          hauntConfig,
          questions: shuffledQuestions,
          ads,
        }));

        // Update PWA theme color only (keep static manifest)
        // Note: Dynamic manifest removed to prevent blob URL warnings

        // Update theme color
        if (hauntConfig?.theme?.primaryColor) {
          updateMetaThemeColor(hauntConfig.theme.primaryColor);
        }

        // Check if haunt is configured for group mode and has proper tier access
        if (hauntConfig?.mode === "queue" && (hauntConfig?.tier === "pro" || hauntConfig?.tier === "premium")) {
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
    // Answer bounds check
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    if (answerIndex < 0 || answerIndex >= currentQuestion?.answers?.length) {
      console.warn("Invalid answer selected");
      return;
    }
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
    console.log('Saving score for:', nameToUse, 'Score:', gameState.score, 'Haunt:', gameState.currentHaunt);
    await GameManager.saveScore(nameToUse, gameState);
    console.log('Score saved, clearing cached leaderboard...');
    
    // Clear cached leaderboard data to force fresh fetch
    setLeaderboard([]);
  };

  const handlePlayAgain = async () => {
    console.log('🔄 Play Again clicked - reloading questions and ads...');
    
    // Reload fresh questions and ads for each new game
    const allQuestions = await ConfigLoader.loadTriviaQuestions(gameState.currentHaunt);
    const freshAds = await ConfigLoader.loadAdData(gameState.currentHaunt);
    
    console.log(`✅ Reloaded ${allQuestions.length} total questions for new game`);
    
    const validQuestions = allQuestions.filter(q => 
      q.text && q.answers && q.answers.length >= 2
    );
    
    if (validQuestions.length < allQuestions.length) {
      console.warn(`⚠️ Filtered out ${allQuestions.length - validQuestions.length} invalid questions`);
    }
    
    const shuffledQuestions = GameManager.shuffleQuestions(validQuestions);
    console.log(`🎲 Shuffled questions for fresh gameplay experience`);
    
    setGameState(prev => ({
      ...GameManager.playAgain(prev),
      questions: shuffledQuestions,
      ads: freshAds,
      currentAdIndex: 0, // Reset ad counter for fresh rotation
    }));
  };

  const handleViewLeaderboard = async () => {
    console.log('Opening leaderboard, fetching fresh data for haunt:', gameState.currentHaunt);
    
    // Clear existing leaderboard and show loading state
    setLeaderboard([]);
    setLeaderboardLoading(true);
    
    // Show leaderboard in loading state
    setGameState(prev => ({
      ...prev,
      showLeaderboard: true,
      showEndScreen: false,
    }));
    
    // Fetch fresh data
    const leaderboardData = await GameManager.getLeaderboard(gameState.currentHaunt);
    console.log('Fresh leaderboard data:', leaderboardData);
    setLeaderboard(leaderboardData);
    setLeaderboardLoading(false);
  };

  const handleCloseLeaderboard = () => {
    setGameState(prev => ({
      ...prev,
      showLeaderboard: false,
      showEndScreen: prev.gameComplete, // Show end screen if game is complete
    }));
  };

  if (isLoading) {
    return <SpookyLoader message="Loading your horror trivia experience" showProgress={true} hauntConfig={gameState.hauntConfig} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-3 sm:p-4">
        <div className="glass-card rounded-xl p-4 sm:p-6 md:p-8 text-center max-w-sm sm:max-w-md w-full">
          <h2 className="font-creepster text-xl sm:text-2xl text-red-500 mb-3 sm:mb-4">
            The Spirits Are Restless
          </h2>
          <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="horror-button px-4 sm:px-6 py-3 rounded-lg font-medium text-white text-sm sm:text-base w-full sm:w-auto"
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
          
          <div className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
            By playing, you agree to our{" "}
            <Link href="/privacy" className="text-red-400 hover:text-red-300 underline">
              Privacy Policy
            </Link>
            {" "}and{" "}
            <Link href="/terms" className="text-red-400 hover:text-red-300 underline">
              Terms of Use
            </Link>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (showNamePrompt) {
    return <NicknamePrompt />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <GameHeader gameState={gameState} />
      
      <main className="px-3 sm:px-4 pb-20">
        {isGroupMode && !activeRound ? (
          <Card className="bg-gray-900/50 border-gray-700 text-white max-w-sm sm:max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-400 flex items-center justify-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                Group Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3 sm:space-y-4">
              <div className="text-gray-300 text-sm sm:text-base">
                Welcome, <span className="text-white font-bold">{playerName}</span>!
              </div>
              <div className="text-yellow-400 text-base sm:text-lg">
                Waiting for host to start the game...
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">
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
        isLoading={leaderboardLoading}
      />
      
      <Footer showInstallButton={true} />
    </div>
  );
}
