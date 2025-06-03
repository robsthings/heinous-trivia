import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Footer } from "@/components/Footer";
import { SpookyLoader } from "@/components/SpookyLoader";
import { MiniSpookyLoader } from "@/components/MiniSpookyLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ConfigLoader } from "@/lib/configLoader";
import { Eye, EyeOff, Clock } from "lucide-react";
import type { TriviaQuestion } from "@shared/schema";

interface ActiveRound {
  questionIndex: number;
  question: TriviaQuestion;
  status: "countdown" | "live" | "reveal" | "waiting";
  startTime: number;
  currentAnswers: Record<string, string>;
  totalQuestions: number;
  hiddenPlayers?: Record<string, boolean>;
  playerScores?: Record<string, number>;
  playerNames?: Record<string, string>;
  countdownDuration?: number;
  resetPlayerAnswers?: boolean;
}

export default function HostPanel() {
  const [, params] = useRoute("/host-panel/:hauntId");
  const hauntId = params?.hauntId || "";
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [activeRound, setActiveRound] = useState<ActiveRound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [allPlayers, setAllPlayers] = useState<Record<string, { score: number; lastSeen: number }>>({});
  const [countdownDuration, setCountdownDuration] = useState(3);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      if (!hauntId) {
        toast({
          title: "Error",
          description: "No haunt ID provided",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      try {
        // Verify haunt exists and user has access
        const hauntRef = doc(firestore, 'haunts', hauntId);
        const hauntSnap = await getDoc(hauntRef);
        
        if (!hauntSnap.exists()) {
          toast({
            title: "Haunt Not Found",
            description: `Haunt '${hauntId}' does not exist`,
            variant: "destructive"
          });
          return;
        }
        
        const hauntData = hauntSnap.data();
        
        // Check authentication - ensure user has access to this haunt
        const savedCode = localStorage.getItem(`heinous-admin-${hauntId}`);
        if (!savedCode || savedCode !== hauntData.authCode) {
          toast({
            title: "Access Denied",
            description: "You must authenticate to access this host panel",
            variant: "destructive"
          });
          return;
        }
        
        const loadedQuestions = await ConfigLoader.loadTriviaQuestions(hauntId);
        // Take first 10 questions for the round
        setQuestions(loadedQuestions.slice(0, 10));
      } catch (error) {
        console.error('Failed to load questions:', error);
        toast({
          title: "Error",
          description: "Failed to load trivia questions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [hauntId, toast]);

  // Poll for active round updates
  useEffect(() => {
    if (!hauntId) return;

    const pollForUpdates = async () => {
      try {
        const response = await fetch(`/api/host/${hauntId}/round`);
        if (response.ok) {
          const roundData = await response.json();
          setActiveRound(roundData);
        }
      } catch (error) {
        console.error('Error polling for round updates:', error);
      }
    };

    // Initial load
    pollForUpdates();

    // Poll every 2 seconds for updates
    const interval = setInterval(pollForUpdates, 2000);

    return () => clearInterval(interval);
  }, [hauntId]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startNewRound = async () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Cannot start round without questions loaded",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const roundData: ActiveRound = {
        questionIndex: 0,
        question: questions[0],
        status: "waiting",
        startTime: Date.now(),
        currentAnswers: {},
        totalQuestions: questions.length
      };

      const response = await fetch(`/api/host/${hauntId}/start-round`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roundData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to start round');
      }

      toast({
        title: "Round Started",
        description: "New group trivia round has been created!",
      });
    } catch (error) {
      console.error('Failed to start round:', error);
      toast({
        title: "Error",
        description: "Failed to start new round",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = async () => {
    if (!activeRound) return;

    try {
      // Start custom countdown
      setCountdown(countdownDuration);
      
      // Update status to countdown via server API
      const response = await fetch(`/api/host/${hauntId}/round`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: "countdown",
          startTime: Date.now(),
          countdownDuration: countdownDuration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update round status');
      }

      // After countdown, set to live
      setTimeout(async () => {
        const liveResponse = await fetch(`/api/host/${hauntId}/round`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: "live",
            resetPlayerAnswers: false
          })
        });
        
        if (liveResponse.ok) {
          setCountdown(0);
        }
      }, countdownDuration * 1000);

      toast({
        title: "Question Started",
        description: `${countdownDuration}-second countdown started!`,
      });
    } catch (error) {
      console.error('Failed to start question:', error);
      toast({
        title: "Error",
        description: "Failed to start question",
        variant: "destructive"
      });
    }
  };

  const revealAnswer = async () => {
    if (!activeRound) return;

    try {
      const response = await fetch(`/api/host/${hauntId}/round`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: "reveal"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reveal answer');
      }

      toast({
        title: "Answer Revealed",
        description: "Correct answer is now shown to all players",
      });
    } catch (error) {
      console.error('Failed to reveal answer:', error);
      toast({
        title: "Error",
        description: "Failed to reveal answer",
        variant: "destructive"
      });
    }
  };

  const nextQuestion = async () => {
    if (!activeRound) return;

    const nextIndex = activeRound.questionIndex + 1;
    
    if (nextIndex >= questions.length) {
      // End of round
      try {
        const response = await fetch(`/api/host/${hauntId}/round`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: "waiting",
            questionIndex: -1 // Indicates round is complete
          })
        });

        if (response.ok) {
          toast({
            title: "Round Complete",
            description: "All questions have been answered!",
          });
        }
      } catch (error) {
        console.error('Failed to end round:', error);
      }
      return;
    }

    try {
      const response = await fetch(`/api/host/${hauntId}/round`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionIndex: nextIndex,
          question: questions[nextIndex],
          status: "waiting",
          currentAnswers: {},
          startTime: Date.now(),
          resetPlayerAnswers: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to advance question');
      }

      toast({
        title: "Next Question",
        description: `Advanced to question ${nextIndex + 1} of ${questions.length}`,
      });
    } catch (error) {
      console.error('Failed to advance question:', error);
      toast({
        title: "Error",
        description: "Failed to advance to next question",
        variant: "destructive"
      });
    }
  };

  const togglePlayerVisibility = async (playerName: string) => {
    if (!activeRound) return;

    try {
      const currentHidden = activeRound.hiddenPlayers || {};
      const newHiddenStatus = !currentHidden[playerName];
      
      const response = await fetch(`/api/host/${hauntId}/round`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [`hiddenPlayers.${playerName}`]: newHiddenStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update player visibility');
      }

      toast({
        title: newHiddenStatus ? "Player Hidden" : "Player Shown",
        description: `${playerName} is now ${newHiddenStatus ? 'hidden from' : 'visible on'} public leaderboards`,
      });
    } catch (error) {
      console.error('Failed to toggle player visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update player visibility",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "countdown": return "text-yellow-400";
      case "live": return "text-green-400";
      case "reveal": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  if (isLoading && !activeRound) {
    return <SpookyLoader message="Preparing your host chamber..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-red-500">
              🎮 Host Panel - {hauntId}
            </CardTitle>
            <p className="text-center text-gray-300">
              Control your group trivia game
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Game Status */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-400">🎯 Game Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeRound ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className={`font-bold text-lg capitalize ${getStatusColor(activeRound.status)}`}>
                            {activeRound.status}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Question</p>
                          <p className="font-bold text-lg text-white">
                            {activeRound.questionIndex + 1} / {activeRound.totalQuestions}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Players</p>
                          <p className="font-bold text-lg text-white">
                            {Object.keys(activeRound.currentAnswers).length}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Countdown</p>
                          <p className="font-bold text-lg text-yellow-400">
                            {countdown > 0 ? countdown : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Current Question */}
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                        <h3 className="text-white font-bold mb-2">Current Question:</h3>
                        <p className="text-gray-300 mb-4">{activeRound.question.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activeRound.question.answers.map((answer, index) => (
                            <div 
                              key={index}
                              className={`p-2 rounded border ${
                                index === activeRound.question.correctAnswer 
                                  ? 'border-green-500 bg-green-900/20' 
                                  : 'border-gray-600 bg-gray-800/50'
                              }`}
                            >
                              <span className="font-bold text-red-400">{String.fromCharCode(65 + index)}:</span>
                              <span className="text-white ml-2">{answer}</span>
                              {index === activeRound.question.correctAnswer && (
                                <span className="text-green-400 ml-2">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">No active round</p>
                      <p className="text-gray-500 text-sm">
                        {questions.length} questions loaded and ready
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Host Controls */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-400">🎛️ Host Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Countdown Timer Setting */}
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <Label htmlFor="countdown" className="text-white font-medium">
                        Countdown Duration
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="countdown"
                          type="number"
                          min="1"
                          max="30"
                          value={countdownDuration}
                          onChange={(e) => setCountdownDuration(Math.max(1, Math.min(30, parseInt(e.target.value) || 3)))}
                          className="w-20 bg-gray-700 border-gray-600 text-white"
                        />
                        <span className="text-gray-300 text-sm">seconds</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        Time players see countdown before question goes live
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {!activeRound ? (
                      <Button
                        onClick={startNewRound}
                        disabled={isLoading || questions.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white h-12"
                      >
                        🚀 Start Group Game
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={startCountdown}
                          disabled={activeRound.status !== "waiting"}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white h-12"
                        >
                          ⏱️ Start Question
                        </Button>
                        
                        <Button
                          onClick={revealAnswer}
                          disabled={activeRound.status !== "live"}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                        >
                          👁️ Reveal Answer
                        </Button>
                        
                        <Button
                          onClick={nextQuestion}
                          disabled={activeRound.status !== "reveal"}
                          className="bg-purple-600 hover:bg-purple-700 text-white h-12"
                        >
                          ➡️ Next Question
                        </Button>
                        
                        <Button
                          onClick={startNewRound}
                          variant="outline"
                          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white h-12"
                        >
                          🔄 New Round
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Player Answers (if active round) */}
              {activeRound && Object.keys(activeRound.currentAnswers).length > 0 && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400">📝 Player Answers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(activeRound.currentAnswers).map(([playerId, answer]) => (
                        <div key={playerId} className="bg-gray-800/50 p-3 rounded border border-gray-600">
                          <p className="text-white font-medium">{playerId}</p>
                          <p className="text-gray-300">Answer: <span className="text-red-400 font-bold">{answer}</span></p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Moderate Leaderboard */}
              {activeRound && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400">🛡️ Moderate Leaderboard</CardTitle>
                    <p className="text-gray-400 text-sm">Control player name visibility on public leaderboards</p>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(activeRound.currentAnswers).length > 0 ? (
                      <div className="space-y-3">
                        {Object.keys(activeRound.currentAnswers).map((playerId) => {
                          const isHidden = activeRound.hiddenPlayers?.[playerId] || false;
                          const playerScore = activeRound.playerScores?.[playerId] || 0;
                          const playerName = activeRound.playerNames?.[playerId] || playerId;
                          
                          return (
                            <div key={playerId} className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-600">
                              <div className="flex items-center space-x-3">
                                <div className="text-white font-medium">
                                  {playerName}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  ID: {playerId}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  Score: {playerScore}
                                </div>
                                {isHidden && (
                                  <div className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded">
                                    HIDDEN
                                  </div>
                                )}
                              </div>
                              
                              <Button
                                onClick={() => togglePlayerVisibility(playerId)}
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 ${
                                  isHidden 
                                    ? 'text-yellow-400 hover:text-yellow-300' 
                                    : 'text-green-400 hover:text-green-300'
                                }`}
                                title={isHidden ? 'Show player on leaderboards' : 'Hide player from leaderboards'}
                              >
                                {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          );
                        })}
                        
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
                          <p className="text-blue-300 text-sm">
                            <strong>ℹ️ Note:</strong> Hidden players will see "Player ####" instead of their name on public leaderboards, 
                            but can still see their own name in their game view.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-6">
                        <p>No players have joined this round yet.</p>
                        <p className="text-sm mt-2">Players will appear here when they submit answers.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}