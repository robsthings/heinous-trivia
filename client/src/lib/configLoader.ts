import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | null> {
    try {
      const response = await fetch(`/api/haunt-config/${haunt}`);
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
        return this.shuffleArray(questions);
      }
      return [];
    } catch (error) {
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