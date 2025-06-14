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

      console.log("🎮 Starting analytics session:", sessionData);
      const response = await apiRequest("POST", "/api/analytics/session", sessionData);
      const data = await response.json() as { id: number };

      this.currentSessionId = data.id;
      console.log("✅ Analytics session started with ID:", data.id);
      return data.id;
    } catch (error) {
      console.error("❌ Failed to start analytics session:", error);
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
      await apiRequest("PUT", `/api/analytics/session/${this.currentSessionId}`, updateData);
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
      console.log("📺 Tracking ad view:", data);
      await apiRequest("POST", "/api/analytics/ad-interaction", data);
      console.log("✅ Ad view tracked successfully");
    } catch (error) {
      console.error("❌ Failed to track ad view:", error);
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
      console.log("🖱️ Tracking ad click:", data);
      await apiRequest("POST", "/api/analytics/ad-interaction", data);
      console.log("✅ Ad click tracked successfully");
    } catch (error) {
      console.error("❌ Failed to track ad click:", error);
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
      await apiRequest("POST", "/api/analytics/question-performance", data);
    } catch (error) {
      console.warn("Failed to track question performance:", error);
    }
  }

  // Reset session (for new games)
  static resetSession(): void {
    this.currentSessionId = null;
  }
}