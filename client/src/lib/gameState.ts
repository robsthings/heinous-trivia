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
    
    // Check if we've completed 5 questions and should show an ad
    if (state.questionsAnswered > 0 && state.questionsAnswered % this.QUESTIONS_PER_ROUND === 0) {
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

  static saveScore(playerName: string, state: GameState): void {
    const leaderboard = this.getLeaderboard();
    const entry: LeaderboardEntry = {
      name: playerName,
      score: state.score,
      date: new Date().toISOString(),
      haunt: state.currentHaunt,
      questionsAnswered: state.questionsAnswered,
      correctAnswers: state.correctAnswers,
    };

    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    const topTen = leaderboard.slice(0, 10);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topTen));
  }

  static getLeaderboard(): LeaderboardEntry[] {
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

  static shuffleQuestions(questions: TriviaQuestion[]): TriviaQuestion[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
