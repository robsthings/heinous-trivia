import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";
import { firestore } from "./firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | null> {
    try {
      const docRef = doc(firestore, 'haunts', haunt);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data === 'object') {
          return data as HauntConfig;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load haunt config:', error);
      return null;
    }
  }

  static async loadTriviaQuestions(haunt: string): Promise<TriviaQuestion[]> {
    try {
      let allQuestions: TriviaQuestion[] = [];

      // Load from haunts collection where trivia data is actually stored
      try {
        const hauntDoc = doc(firestore, 'haunts', haunt);
        const hauntSnap = await getDoc(hauntDoc);
        
        if (hauntSnap.exists()) {
          const hauntData = hauntSnap.data();
          if (hauntData && hauntData.questions) {
            allQuestions.push(...hauntData.questions);
          }
        }
      } catch (error) {
        console.log('No haunt-specific trivia found');
      }

      // If no haunt-specific questions, try to load from general collections
      if (allQuestions.length === 0) {
        try {
          const packsQuery = collection(firestore, 'trivia-packs');
          const packsSnapshot = await getDocs(packsQuery);
          
          packsSnapshot.docs.forEach(doc => {
            const pack = doc.data();
            if (pack.accessType === 'all' && pack.questions) {
              allQuestions.push(...pack.questions);
            }
          });
        } catch (error) {
          console.log('No trivia packs found');
        }

        // Also try the custom trivia collection
        try {
          const customTriviaRef = doc(firestore, 'trivia-custom', haunt);
          const customTriviaSnap = await getDoc(customTriviaRef);
          
          if (customTriviaSnap.exists()) {
            const customData = customTriviaSnap.data();
            if (customData && customData.questions) {
              allQuestions.push(...customData.questions);
            }
          }
        } catch (error) {
          console.log('No custom trivia found for haunt');
        }
      }

      return this.shuffleArray(allQuestions);
    } catch (error) {
      console.error('Failed to load trivia questions:', error);
      return [];
    }
  }

  static async loadAdData(haunt: string): Promise<AdData[]> {
    try {
      const adsQuery = collection(firestore, 'haunt-ads', haunt, 'ads');
      const adsSnapshot = await getDocs(adsQuery);
      
      const allAds: AdData[] = [];
      adsSnapshot.docs.forEach(doc => {
        const ad = doc.data();
        if (ad) {
          allAds.push(ad as AdData);
        }
      });

      if (allAds.length === 0) {
        console.warn(`No ads found for haunt: ${haunt}`);
      }

      return this.shuffleArray(allAds);
    } catch (error) {
      console.error('Failed to load ad data from Firebase:', error);
      throw error;
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