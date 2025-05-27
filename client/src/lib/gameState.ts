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
  private static readonly QUESTIONS_PER_ROUND = 5;

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

  static selectAnswer(state: GameState, answerIndex: number): GameState {
    if (state.selectedAnswer !== null) return state;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    
    // Prevent crash from undefined question
    if (!currentQuestion || typeof currentQuestion.correctAnswer !== 'number') {
      console.error('Invalid question data, skipping answer selection');
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
    
    // Check if we've completed 3 questions and should show an ad (more frequent ads)
    if (state.questionsAnswered > 0 && state.questionsAnswered % 3 === 0) {
      if (nextIndex >= state.questions.length) {
        // Game complete
        return {
          ...state,
          gameComplete: true,
          showEndScreen: true,
          showFeedback: false,
          selectedAnswer: null,
        };
      } else {
        // Show ad between rounds
        return {
          ...state,
          showAd: true,
          showFeedback: false,
          selectedAnswer: null,
        };
      }
    }

    // Continue to next question
    if (nextIndex >= state.questions.length) {
      return {
        ...state,
        gameComplete: true,
        showEndScreen: true,
        showFeedback: false,
        selectedAnswer: null,
      };
    }

    return {
      ...state,
      currentQuestionIndex: nextIndex,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
    };
  }

  static closeAd(state: GameState): GameState {
    return {
      ...state,
      showAd: false,
      currentQuestionIndex: state.currentQuestionIndex + 1,
      currentAdIndex: (state.currentAdIndex + 1) % state.ads.length,
    };
  }

  static async saveScore(playerName: string, state: GameState): Promise<void> {
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
      console.error('Failed to save score:', error);
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
      return dbEntries.map((entry: any) => ({
        name: entry.name,
        score: entry.score,
        date: entry.date,
        haunt: entry.haunt,
        questionsAnswered: entry.questionsAnswered,
        correctAnswers: entry.correctAnswers,
      }));
    } catch (error) {
      console.error('Failed to fetch leaderboard from database:', error);
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
