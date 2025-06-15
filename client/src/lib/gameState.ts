/**
 * FIREBASE FIELD NAME REFERENCE: Check /fieldGlossary.json before modifying any Firebase operations
 * - Use 'haunt' for query parameters, 'hauntId' for Firebase document fields
 * - Use 'action' for ad interactions (NOT 'interactionType')
 * - Collections: game_sessions, ad_interactions (snake_case), haunt-ads (kebab-case)
 * - Verify all field names against canonical glossary before changes
 */
import type { TriviaQuestion, LeaderboardEntry, HauntConfig, AdData } from "@shared/schema";

export interface GameState {
  currentHaunt: string;
  hauntConfig: HauntConfig | null;
  score: number;
  currentQuestionIndex: number;
  questions: TriviaQuestion[];
  ads: AdData[];
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean;
  gameComplete: boolean;
  showAd: boolean;
  showLeaderboard: boolean;
  showEndScreen: boolean;
  correctAnswers: number;
  questionsAnswered: number;
  currentAdIndex: number;
}

export class GameManager {
  private static readonly STORAGE_KEY = 'heinous-trivia-leaderboard';
  private static readonly QUESTIONS_PER_ROUND = 20; // Longer gameplay sessions

  static createInitialState(haunt: string): GameState {
    return {
      currentHaunt: haunt,
      hauntConfig: null,
      score: 0,
      currentQuestionIndex: 0,
      questions: [],
      ads: [],
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
      gameComplete: false,
      showAd: false,
      showLeaderboard: false,
      showEndScreen: false,
      correctAnswers: 0,
      questionsAnswered: 0,
      currentAdIndex: 0,
    };
  }

  static async initializeGameState(haunt: string): Promise<Partial<GameState>> {
    try {
      // Load questions and ads for the haunt
      const [questionsResponse, adsResponse] = await Promise.all([
        fetch(`/api/trivia-questions/${haunt}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/ads/${haunt}`, {
          headers: {
            'Cache-Control': 'no-cache', 
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!questionsResponse.ok) {
        throw new Error(`Failed to load questions: ${questionsResponse.status}`);
      }

      const questions = await questionsResponse.json();
      const ads = adsResponse.ok ? await adsResponse.json() : [];

      // Validate questions data
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No valid questions available for this haunt');
      }

      return {
        questions: questions.slice(0, this.QUESTIONS_PER_ROUND), // Limit to 20 questions
        ads: Array.isArray(ads) ? ads : [],
      };
    } catch (error) {
      console.error('Failed to initialize game state:', error);
      throw error;
    }
  }

  static selectAnswer(state: GameState, answerIndex: number): GameState {
    if (state.selectedAnswer !== null) return state;
    
    // Answer bounds check
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (answerIndex < 0 || answerIndex >= currentQuestion?.answers?.length) {
      // Invalid answer selected
      return state;
    }
    
    // Prevent crash from undefined question
    if (!currentQuestion || typeof currentQuestion.correctAnswer !== 'number') {
      // Invalid question data, skipping answer selection
      return state;
    }
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const points = isCorrect ? (currentQuestion.points || 100) : 0;

    return {
      ...state,
      selectedAnswer: answerIndex,
      showFeedback: true,
      isCorrect,
      score: state.score + points,
      correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
      questionsAnswered: state.questionsAnswered + 1,
    };
  }

  static nextQuestion(state: GameState): GameState {
    const nextIndex = state.currentQuestionIndex + 1;
    
    // Check if we've completed the full round (20 questions) OR reached the end of available questions
    if (state.questionsAnswered >= this.QUESTIONS_PER_ROUND || nextIndex >= state.questions.length) {
      // Game complete after 20 questions or when we run out of questions
      return {
        ...state,
        gameComplete: true,
        showEndScreen: true,
        showFeedback: false,
        selectedAnswer: null,
      };
    }
    
    // Check if we've completed 5, 10, or 15 questions and should show an ad
    if (state.questionsAnswered > 0 && state.questionsAnswered % 5 === 0 && state.questionsAnswered < this.QUESTIONS_PER_ROUND) {
      // Show ad between rounds - advance question index and select random ad
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        showAd: true,
        showFeedback: false,
        selectedAnswer: null,
        currentAdIndex: state.ads.length > 0 ? Math.floor(Math.random() * state.ads.length) : 0,
      };
    }

    // Continue to next question
    return {
      ...state,
      currentQuestionIndex: nextIndex,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
    };
  }

  static closeAd(state: GameState): GameState {
    // Check if we've reached the end of available questions
    if (state.currentQuestionIndex >= state.questions.length) {
      // Game complete after this ad
      return {
        ...state,
        showAd: false,
        gameComplete: true,
        showEndScreen: true,
        currentAdIndex: state.ads.length > 0 ? Math.floor(Math.random() * state.ads.length) : 0,
      };
    }
    
    // Simply close the ad - question index was already advanced in nextQuestion
    return {
      ...state,
      showAd: false,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
      currentAdIndex: state.ads.length > 0 ? Math.floor(Math.random() * state.ads.length) : 0,
    };
  }

  static async saveScore(playerName: string, state: GameState): Promise<void> {
    // Import AnalyticsTracker dynamically to avoid circular imports
    const { AnalyticsTracker } = await import('./analytics');
    
    // Complete the analytics session when score is saved
    await AnalyticsTracker.completeSession(
      state.questionsAnswered,
      state.correctAnswers,
      state.score
    );

    const entry = {
      name: playerName,
      score: state.score,
      haunt: state.currentHaunt,
      questionsAnswered: state.questionsAnswered,
      correctAnswers: state.correctAnswers,
    };

    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to save score');
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      const localLeaderboard = this.getLocalLeaderboard();
      const localEntry: LeaderboardEntry = {
        ...entry,
        date: new Date().toISOString(),
      };
      localLeaderboard.push(localEntry);
      localLeaderboard.sort((a, b) => b.score - a.score);
      const topTen = localLeaderboard.slice(0, 10);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topTen));
    }
  }

  static async getLeaderboard(haunt?: string): Promise<LeaderboardEntry[]> {
    try {
      const url = haunt ? `/api/leaderboard/${haunt}` : '/api/leaderboard';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const dbEntries = await response.json();
      
      // Transform database entries to match frontend format
      const transformed = dbEntries.map((entry: any) => ({
        name: entry.name,
        score: entry.score,
        date: entry.date,
        haunt: entry.haunt,
        questionsAnswered: entry.questionsAnswered,
        correctAnswers: entry.correctAnswers,
      }));
      return transformed;
    } catch (error) {
      // Fallback to localStorage
      return this.getLocalLeaderboard();
    }
  }

  private static getLocalLeaderboard(): LeaderboardEntry[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static resetGame(state: GameState): GameState {
    return {
      ...this.createInitialState(state.currentHaunt),
      hauntConfig: state.hauntConfig,
      questions: state.questions,
      ads: state.ads,
    };
  }

  static playAgain(state: GameState): GameState {
    // Reshuffle the existing questions for a new game experience
    const reshuffledQuestions = this.shuffleQuestions(state.questions);
    
    return {
      ...this.createInitialState(state.currentHaunt),
      hauntConfig: state.hauntConfig,
      questions: reshuffledQuestions,
      ads: state.ads,
      showEndScreen: false,
      gameComplete: false,
      showLeaderboard: false,
    };
  }

  static shuffleQuestions(questions: TriviaQuestion[]): TriviaQuestion[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
