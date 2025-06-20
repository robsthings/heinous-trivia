import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { TriviaCard } from "@/components/TriviaCard";
import { InterstitialAd } from "@/components/InterstitialAd";
import { GameEndScreen } from "@/components/GameEndScreen";
import { Leaderboard } from "@/components/Leaderboard";
import { Footer } from "@/components/Footer";
import { SpookyLoader } from "@/components/SpookyLoader";
import { MiniSpookyLoader } from "@/components/MiniSpookyLoader";
import { ConfigLoader } from "@/lib/configLoader";
import { HauntSecurity } from "@/lib/hauntSecurity";
import { GameManager, type GameState } from "@/lib/gameState";
import type { HauntConfig } from "@shared/schema";
import { AnalyticsTracker } from "@/lib/analytics";
import { updateMetaThemeColor } from "@/lib/manifestGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { LeaderboardEntry } from "@shared/schema";
import { useCustomSkin } from "@/hooks/use-custom-skin";

function Game() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>(() => 
    GameManager.createInitialState(HauntSecurity.getHauntFromURL())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [playerName, setPlayerName] = useState<string>(() => 
    localStorage.getItem(`heinous-player-name-${HauntSecurity.getHauntFromURL()}`) || ""
  );
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState("");
  const [loadedHauntConfig, setLoadedHauntConfig] = useState<HauntConfig | undefined>(undefined);
  const { toast } = useToast();

  // Redirect to welcome screen unless coming from welcome screen
  useEffect(() => {
    const fromWelcomeScreen = sessionStorage.getItem('fromWelcomeScreen');
    
    // Validate haunt access before proceeding
    const validateAndRedirect = async () => {
      const currentHaunt = HauntSecurity.getHauntFromURL();
      
      if (currentHaunt && currentHaunt !== 'headquarters') {
        const isValidHaunt = await HauntSecurity.validateHauntAccess(currentHaunt);
        if (!isValidHaunt) {
          console.warn(`Invalid haunt access attempt: ${currentHaunt}`);
          setError(`Haunt "${currentHaunt}" not found or not accessible`);
          return;
        }
      }
      
      // Enforce haunt isolation
      HauntSecurity.enforceHauntIsolation(currentHaunt);
      
      if (currentHaunt && !fromWelcomeScreen) {
        console.log('Redirecting to welcome screen for haunt:', currentHaunt);
        setLocation(`/welcome/${currentHaunt}`);
        return;
      } else if (fromWelcomeScreen) {
        console.log('User coming from welcome screen, proceeding to game');
        // Clear the flag so future direct visits go to welcome
        sessionStorage.removeItem('fromWelcomeScreen');
      }
    };
    
    validateAndRedirect();
  }, [setLocation]);

  useCustomSkin(gameState.hauntConfig);

  // Listen for branding updates from admin panel
  useEffect(() => {
    const handleBrandingUpdate = async (event: MessageEvent) => {
      if (event.data.type === 'BRANDING_UPDATED' && event.data.hauntId === gameState.currentHaunt) {
        console.log('Branding update received, reloading configuration...');
        
        try {
          const updatedConfig = await ConfigLoader.loadHauntConfig(gameState.currentHaunt);
          if (updatedConfig) {
            console.log('Updated config loaded:', updatedConfig);
            setGameState(prev => ({ ...prev, hauntConfig: updatedConfig || undefined }));
          }
        } catch (error) {
          console.error('Failed to reload config:', error);
          window.location.href = window.location.href;
        }
      }
    };

    window.addEventListener('message', handleBrandingUpdate);
    return () => window.removeEventListener('message', handleBrandingUpdate);
  }, [gameState.currentHaunt]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Always get current haunt from URL to ensure proper isolation
        const haunt = HauntSecurity.getHauntFromURL();
        if (!haunt) {
          setError('No haunt specified in URL');
          return;
        }

        // Enforce haunt isolation
        HauntSecurity.enforceHauntIsolation(haunt);

        const [gameConfig, hauntConfig] = await Promise.all([
          GameManager.initializeGameState(haunt),
          ConfigLoader.loadHauntConfig(haunt)
        ]);

        setGameState(prev => ({ 
          ...prev, 
          ...gameConfig,
          currentHaunt: haunt, // Ensure current haunt is updated
          hauntConfig: hauntConfig || undefined
        }));
        setLoadedHauntConfig(hauntConfig || undefined);

        if (hauntConfig?.theme?.primaryColor) {
          updateMetaThemeColor(hauntConfig.theme.primaryColor);
        }

        // Apply custom background skin only when actually configured
        if (hauntConfig?.skinUrl && hauntConfig?.tier === 'premium') {
          document.documentElement.style.setProperty('--custom-background-url', `url(${hauntConfig.skinUrl})`);
          document.body.classList.add('custom-skin');
        } else {
          document.documentElement.style.removeProperty('--custom-background-url');
          document.body.classList.remove('custom-skin');
        }

        if (!playerName) {
          setShowNamePrompt(true);
        } else {
          AnalyticsTracker.startSession(haunt, 'individual');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
    
    // Cleanup function to remove custom skin when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--custom-background-url');
      document.body.classList.remove('custom-skin');
    };
  }, [gameState.currentHaunt]);

  const savePlayerInfo = (name: string) => {
    const haunt = gameState.currentHaunt;
    
    localStorage.setItem(`heinous-player-name-${haunt}`, name);
    
    setPlayerName(name);
    setShowNamePrompt(false);
    setTempName("");

    AnalyticsTracker.startSession(haunt, 'individual');
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newState = GameManager.selectAnswer(gameState, answerIndex);
    setGameState(newState);
  };

  const handleNextQuestion = () => {
    const newState = GameManager.nextQuestion(gameState);
    setGameState(newState);
  };

  const handleCloseAd = () => {
    setGameState(prev => GameManager.closeAd(prev));
  };

  const handleVisitAd = (link: string) => {
    const adIndex = gameState.currentAdIndex || 0;
    const currentAd = gameState.ads[adIndex];
    
    // Track the ad click using the existing analytics method
    AnalyticsTracker.trackAdClick(gameState.currentHaunt, adIndex, currentAd?.id);

    window.open(link, '_blank');
  };

  const handleSaveScore = (playerNameOverride?: string) => {
    const nameToUse = playerNameOverride || playerName;
    
    if (nameToUse && gameState.score > 0) {
      GameManager.saveScore(nameToUse, gameState);
    }
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleViewLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const response = await fetch(`/api/leaderboard/${gameState.currentHaunt}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
        console.log('Leaderboard loaded:', data.length, 'entries');
      } else {
        console.error('Failed to fetch leaderboard:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <SpookyLoader 
          message="Loading your trivia experience..." 
          showProgress={true}
          hauntConfig={loadedHauntConfig}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center px-4">
        <Card className="bg-gray-900/50 border-gray-700 text-white max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">{error}</p>
            <Link href="/">
              <Button variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center px-4">
        <Card className="bg-gray-900/50 border-gray-700 text-white max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-400 flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Enter Your Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Your display name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && tempName.trim()) {
                  savePlayerInfo(tempName.trim());
                }
              }}
            />
            <Button 
              onClick={() => tempName.trim() && savePlayerInfo(tempName.trim())}
              disabled={!tempName.trim()}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Start Playing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.gameComplete || gameState.showEndScreen) {
    return (
      <div 
        className={`game-container min-h-screen ${gameState.hauntConfig?.skinUrl ? '' : 'bg-gradient-dark'}`}
        style={{
          background: gameState.hauntConfig?.skinUrl 
            ? `url(${gameState.hauntConfig.skinUrl}) center/cover`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          minHeight: '100vh'
        }}
      >
        <GameHeader gameState={gameState} />
        
        <main className="px-3 sm:px-4 pb-20">
          <GameEndScreen
            gameState={gameState}
            onSaveScore={handleSaveScore}
            onPlayAgain={handlePlayAgain}
            onViewLeaderboard={handleViewLeaderboard}
            playerName={playerName}
          />
        </main>

        <Leaderboard
          isVisible={leaderboard.length > 0}
          leaderboard={leaderboard}
          onClose={() => setLeaderboard([])}
          hauntId={gameState.currentHaunt}
          currentPlayer={playerName}
          isLoading={leaderboardLoading}
        />

        <Footer showInstallButton={true} />
      </div>
    );
  }

  return (
    <div 
      className={`game-container min-h-screen ${gameState.hauntConfig?.skinUrl ? '' : 'bg-gradient-dark'}`}
      style={{
        background: gameState.hauntConfig?.skinUrl 
          ? `url(${gameState.hauntConfig.skinUrl}) center/cover`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        minHeight: '100vh'
      }}
    >
      <GameHeader 
        gameState={gameState}
      />
      
      <main className="px-3 sm:px-4 pb-20">
        {!gameState.showAd && (
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

      <Footer showInstallButton={true} />
    </div>
  );
}

export default Game;