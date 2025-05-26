import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | null> {
    try {
      const response = await fetch(`/api/haunt/${haunt}`);
      if (!response.ok) {
        throw new Error(`Failed to load haunt config: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load haunt config:', error);
      return null;
    }
  }

  static async loadTriviaQuestions(haunt: string): Promise<TriviaQuestion[]> {
    try {
      const response = await fetch(`/api/questions/${haunt}`);
      if (!response.ok) {
        throw new Error(`Failed to load trivia questions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load trivia questions:', error);
      return [];
    }
  }

  static async loadAdData(haunt: string): Promise<AdData[]> {
    try {
      const response = await fetch(`/api/ads/${haunt}`);
      if (!response.ok) {
        throw new Error(`Failed to load ad data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load ad data:', error);
      return [];
    }
  }
}

export function getHauntFromURL(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('haunt') || 'widowshollow';
}
