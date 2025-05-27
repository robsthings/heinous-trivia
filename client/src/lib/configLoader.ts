import type { HauntConfig, TriviaQuestion, AdData } from "@shared/schema";
import { firestore } from "./firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export class ConfigLoader {
  static async loadHauntConfig(haunt: string): Promise<HauntConfig | null> {
    try {
      // Try Firebase first
      const docRef = doc(firestore, 'haunts', haunt);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as HauntConfig;
      }
      
      // Fallback to API
      const response = await fetch(`/api/haunt/${haunt}`);
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load haunt config:', error);
      return null;
    }
  }

  static async loadTriviaQuestions(haunt: string): Promise<TriviaQuestion[]> {
    try {
      // Load core questions from API
      const coreQuestions: TriviaQuestion[] = [];
      try {
        const response = await fetch(`/api/questions/${haunt}`);
        if (response.ok) {
          const apiQuestions = await response.json();
          coreQuestions.push(...apiQuestions);
        }
      } catch (error) {
        console.log(`No API questions found for ${haunt}`);
      }
      
      // Load custom questions from Firebase
      const customQuestions: TriviaQuestion[] = [];
      try {
        const questionsRef = collection(firestore, 'trivia-custom', haunt, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          customQuestions.push({
            id: doc.id,
            text: data.question,
            category: "Custom",
            difficulty: 1,
            answers: data.choices,
            correctAnswer: data.choices.indexOf(data.correct),
            explanation: `The correct answer is ${data.correct}`,
            points: 10
          } as TriviaQuestion);
        });
      } catch (error) {
        // Continue without custom questions
      }
      
      // Merge and shuffle all questions
      let allQuestions = [...coreQuestions, ...customQuestions];
      
      // If no questions found, try to load from starter pack
      if (allQuestions.length === 0) {
        try {
          const starterPackRef = doc(firestore, 'trivia-packs', 'starter-pack');
          const starterPackDoc = await getDoc(starterPackRef);
          
          if (starterPackDoc.exists()) {
            const starterData = starterPackDoc.data();
            if (starterData.questions && Array.isArray(starterData.questions)) {
              allQuestions = starterData.questions.map((q: any) => ({
                id: q.id || `starter-${Math.random()}`,
                text: q.question || q.text,
                choices: q.choices || [],
                correct: q.correct || q.answer
              }));
              console.log(`Loaded ${allQuestions.length} questions from starter pack`);
            }
          }
        } catch (error) {
          console.log('No starter pack available:', error);
        }
      }
      
      // Shuffle using Fisher-Yates algorithm
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
      
      return allQuestions;
    } catch (error) {
      console.error('Failed to load trivia questions:', error);
      return [];
    }
  }

  static async loadAdData(haunt: string): Promise<AdData[]> {
    try {
      // Load custom ads from Firebase (prioritized)
      const customAds: AdData[] = [];
      try {
        const adsRef = collection(firestore, 'haunt-ads', haunt, 'ads');
        const querySnapshot = await getDocs(adsRef);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          customAds.push({
            id: doc.id,
            title: data.title || "Custom Ad",
            description: data.description || "Check this out!",
            image: data.imageUrl,
            duration: 5000,
            link: data.link
          });
        });
      } catch (error) {
        // Continue without custom ads
      }
      
      // Load default ads only if no custom ads exist
      if (customAds.length === 0) {
        try {
          const response = await fetch(`/api/ads/${haunt}`);
          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          // Continue without default ads
        }
      }
      
      return customAds;
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
