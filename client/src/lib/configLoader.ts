import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";
import { firestore } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | null> {
    try {
      console.log('🔥 Attempting to load haunt config from Firebase:', haunt);
      
      // Try Firebase first
      const docRef = doc(firestore, 'haunts', haunt);
      console.log('🔍 Looking for document at path:', `haunts/${haunt}`);
      
      const docSnap = await getDoc(docRef);
      console.log('📄 Document exists:', docSnap.exists());
      console.log('📄 Document data:', docSnap.data());
      
      if (docSnap.exists()) {
        const config = docSnap.data() as HauntConfig;
        console.log('✅ Firebase config loaded:', config);
        return config;
      } else {
        console.log('⚠️ No Firebase config found at /haunts/' + haunt + ', falling back to API');
      }
      
      // Fallback to API
      const response = await fetch(`/api/haunt/${haunt}`);
      if (!response.ok) {
        throw new Error(`Failed to load haunt config: ${response.statusText}`);
      }
      const config = await response.json();
      console.log('📁 API config loaded:', config);
      return config;
    } catch (error) {
      console.error('❌ Failed to load haunt config:', error);
      
      // Final fallback to API
      try {
        const response = await fetch(`/api/haunt/${haunt}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (fallbackError) {
        console.error('❌ API fallback also failed:', fallbackError);
      }
      
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
  const hauntId = urlParams.get('haunt') || 'widowshollow';
  console.log('🎃 Haunt ID from URL:', hauntId);
  console.log('🔗 Current URL:', window.location.href);
  return hauntId;
}
