import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | undefined> {
    try {
      // Add cache-busting to ensure fresh config after branding updates
      const cacheBuster = Date.now();
      const response = await fetch(`/api/haunt-config/${haunt}?t=${cacheBuster}`);
      if (response.ok) {
        return await response.json();
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  static async loadTriviaQuestions(haunt: string): Promise<TriviaQuestion[]> {
    try {
      const response = await fetch(`/api/trivia-questions/${haunt}`);
      if (response.ok) {
        const questions = await response.json();
        // Server already provides randomized questions, no need to shuffle again

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
  // First check URL path for /game/:hauntId or /welcome/:hauntId pattern
  const pathParts = window.location.pathname.split('/');
  if (pathParts.length >= 3 && (pathParts[1] === 'game' || pathParts[1] === 'welcome')) {
    const hauntId = pathParts[2];
    // Store the current haunt for session consistency
    sessionStorage.setItem('currentHaunt', hauntId);
    return hauntId;
  }
  
  // Check for query parameter (QR code redirects)
  const urlParams = new URLSearchParams(window.location.search);
  const queryHaunt = urlParams.get('haunt');
  if (queryHaunt) {
    sessionStorage.setItem('currentHaunt', queryHaunt);
    return queryHaunt;
  }
  
  // Admin pages should not interfere with haunt routing
  if (pathParts[1] === 'admin' || pathParts[1] === 'haunt-admin' || pathParts[1] === 'analytics') {
    // Don't return stored haunt for admin pages - they have their own routing
    return 'headquarters'; // Safe default for admin contexts
  }
  
  // For other pages, use stored haunt or default
  return sessionStorage.getItem('currentHaunt') || 'headquarters';
}

export async function validateHauntAccess(hauntId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/haunt-config/${hauntId}`);
    if (response.ok) {
      const config = await response.json();
      // Check if haunt is active and accessible
      return config && config.isActive !== false;
    }
    return false;
  } catch (error) {
    console.error('Failed to validate haunt access:', error);
    return false;
  }
}

export function clearHauntSession() {
  // Clear all haunt-specific session data
  sessionStorage.removeItem('currentHaunt');
  sessionStorage.removeItem('fromWelcomeScreen');
  sessionStorage.removeItem('gameState');
}