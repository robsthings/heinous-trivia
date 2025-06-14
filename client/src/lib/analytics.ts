import { apiRequest } from "./queryClient";

// Generate a unique player ID for tracking
function getPlayerId(): string {
  let playerId = localStorage.getItem('heinous-player-id');
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('heinous-player-id', playerId);
  }
  return playerId;
}

export class AnalyticsTracker {
  private static currentSessionId: number | null = null;

  // Start a new game session
  static async startSession(hauntId: string, sessionType: 'individual' | 'group', groupId?: string): Promise<number | null> {
    try {
      const sessionData = {
        hauntId,
        playerId: getPlayerId(),
        sessionType,
        groupId: groupId || null,
        questionsAnswered: 0,
        correctAnswers: 0,
        finalScore: 0,
      };

      const response = await apiRequest("/api/analytics/session", "POST", sessionData);
      const data = await response.json() as { id: number };

      this.currentSessionId = data.id;
      return data.id;
    } catch (error) {
      return null;
    }
  }

  // Complete a game session
  static async completeSession(questionsAnswered: number, correctAnswers: number, finalScore: number): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const updateData = {
        questionsAnswered,
        correctAnswers,
        finalScore,
        completedAt: new Date().toISOString(),
      };
      await apiRequest(`/api/analytics/session/${this.currentSessionId}`, "PUT", updateData);
    } catch (error) {
      console.warn("Failed to complete analytics session:", error);
    }
  }

  // Track ad interactions
  static async trackAdView(hauntId: string, adIndex: number, adId?: string): Promise<void> {
    try {
      const data = {
        sessionId: this.currentSessionId,
        haunt: hauntId,
        adIndex,
        adId: adId || `ad-${adIndex}`, // Use unique ID when available
        action: "view",
      };
      await apiRequest("/api/analytics/ad-interaction", "POST", data);
    } catch (error) {
      console.warn("Failed to track ad view:", error);
    }
  }

  static async trackAdClick(hauntId: string, adIndex: number, adId?: string): Promise<void> {
    try {
      const data = {
        sessionId: this.currentSessionId,
        haunt: hauntId,
        adIndex,
        adId: adId || `ad-${adIndex}`, // Use unique ID when available
        action: "click",
      };
      await apiRequest("/api/analytics/ad-interaction", "POST", data);
    } catch (error) {
      console.warn("Failed to track ad click:", error);
    }
  }

  // Track question performance
  static async trackQuestionAnswer(
    hauntId: string,
    questionText: string,
    questionPack: string,
    wasCorrect: boolean,
    timeToAnswer?: number
  ): Promise<void> {
    try {
      const data = {
        sessionId: this.currentSessionId,
        haunt: hauntId,
        questionText,
        questionPack,
        wasCorrect,
        timeToAnswer: timeToAnswer || null,
      };
      await apiRequest("/api/analytics/question-performance", "POST", data);
    } catch (error) {
      console.warn("Failed to track question performance:", error);
    }
  }

  // Reset session (for new games)
  static resetSession(): void {
    this.currentSessionId = null;
  }
}