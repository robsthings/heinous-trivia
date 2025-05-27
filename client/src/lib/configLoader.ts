import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";
import { firestore } from "./firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

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
      console.log('📚 Loading trivia questions for haunt:', haunt);
      
      // Load core questions from API/JSON files
      const coreQuestions: TriviaQuestion[] = [];
      try {
        const response = await fetch(`/api/questions/${haunt}`);
        if (response.ok) {
          const apiQuestions = await response.json();
          coreQuestions.push(...apiQuestions);
          console.log('✅ Core questions loaded:', coreQuestions.length);
        }
      } catch (error) {
        console.log('⚠️ No core questions found via API, continuing...');
      }
      
      // Load custom questions from Firebase
      const customQuestions: TriviaQuestion[] = [];
      try {
        const questionsRef = collection(firestore, 'trivia-custom', haunt, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          customQuestions.push({
            question: data.question,
            choices: data.choices,
            correct: data.correct
          } as TriviaQuestion);
        });
        console.log('✅ Custom questions loaded:', customQuestions.length);
      } catch (error) {
        console.log('⚠️ No custom questions found in Firebase, continuing...');
      }
      
      // Merge and shuffle all questions
      const allQuestions = [...coreQuestions, ...customQuestions];
      console.log('🔀 Total questions before shuffle:', allQuestions.length);
      
      // Shuffle the combined array
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
      
      console.log('✅ Questions merged and shuffled:', allQuestions.length);
      return allQuestions;
    } catch (error) {
      console.error('❌ Failed to load trivia questions:', error);
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
