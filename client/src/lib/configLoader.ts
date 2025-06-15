import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | null> {
    try {
      // Add cache-busting to ensure fresh config after branding updates
      const cacheBuster = Date.now();
      const response = await fetch(`/api/haunt-config/${haunt}?t=${cacheBuster}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async loadTriviaQuestions(haunt: string): Promise<TriviaQuestion[]> {
    try {
      const response = await fetch(`/api/trivia-questions/${haunt}`);
      if (response.ok) {
        const questions = await response.json();
        // Server already provides randomized questions, no need to shuffle again
        console.log(`Loaded ${questions.length} pre-randomized questions from server`);
        return questions;
      }
      console.error('Failed to load questions from server');
      return [];
    } catch (error) {
      console.error('Error loading trivia questions:', error);
      return [];
    }
  }

  static async loadAdData(haunt: string): Promise<AdData[]> {
    try {
      const response = await fetch(`/api/ads/${haunt}`);
      if (response.ok) {
        const ads = await response.json();
        return this.shuffleArray(ads);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export function getHauntFromURL(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('haunt') || 'headquarters';
}