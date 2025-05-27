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
        const data = docSnap.data();
        if (data && typeof data === 'object') {
          return data as HauntConfig;
        }
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
      // Prioritize Firebase data over API calls
      const coreQuestions: TriviaQuestion[] = [];
      
      // Load custom questions from Firebase
      const customQuestions: TriviaQuestion[] = [];
      try {
        const questionsRef = collection(firestore, 'trivia-custom', haunt, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          customQuestions.push({
            id: doc.id,
            text: data.question || data.text || 'Question text missing',
            category: "Custom",
            difficulty: 1,
            answers: data.choices || data.answers || [],
            correctAnswer: Math.max(0, (data.choices || data.answers || []).indexOf(data.correct || data.answer || '')),
            explanation: `The correct answer is ${data.correct || data.answer || 'Unknown'}`,
            points: 10
          } as TriviaQuestion);
        });
      } catch (error) {
        console.error('Firebase error loading custom questions:', error);
        // Continue without custom questions
      }

      // Load questions from assigned trivia packs
      const packQuestions: TriviaQuestion[] = [];
      try {
        const hauntRef = doc(firestore, 'haunts', haunt);
        const hauntSnap = await getDoc(hauntRef);
        
        if (hauntSnap.exists()) {
          const hauntData = hauntSnap.data();
          const assignedPacks = hauntData.assignedTriviaPacks || [];
          
          for (const packId of assignedPacks) {
            try {
              const packRef = doc(firestore, 'trivia-packs', packId);
              const packSnap = await getDoc(packRef);
              
              if (packSnap.exists()) {
                const packData = packSnap.data();
                if (packData.questions && Array.isArray(packData.questions)) {
                  const mappedQuestions = packData.questions.map((q: any) => ({
                    id: q.id || `pack-${packId}-${Math.random()}`,
                    text: q.question || q.text || 'Question text missing',
                    category: "Pack",
                    difficulty: 1,
                    answers: q.choices || q.answers || [],
                    correctAnswer: Math.max(0, (q.choices || q.answers || []).indexOf(q.correct || q.answer || '')),
                    explanation: `The correct answer is ${q.correct || q.answer || 'Unknown'}`,
                    points: 10
                  }));
                  packQuestions.push(...mappedQuestions);
                }
              }
            } catch (packError) {
              console.log(`Failed to load pack ${packId}:`, packError);
            }
          }
        }
      } catch (error) {
        // Continue without pack questions
      }
      
      // Merge and shuffle all questions
      let allQuestions = [...coreQuestions, ...customQuestions, ...packQuestions];
      
      // If no questions found, try to load from starter pack
      if (allQuestions.length === 0) {
        console.log('No questions found, trying starter pack fallback...');
        try {
          const starterPackRef = doc(firestore, 'trivia-packs', 'starter-pack');
          const starterPackDoc = await getDoc(starterPackRef);
          
          if (starterPackDoc.exists()) {
            console.log('Starter pack found!');
            const starterData = starterPackDoc.data();
            if (starterData.questions && Array.isArray(starterData.questions)) {
              allQuestions = starterData.questions.map((q: any) => ({
                id: q.id || `starter-${Math.random()}`,
                text: q.question || q.text || 'Question text missing',
                category: "Horror",
                difficulty: 1,
                answers: q.choices || q.answers || [],
                correctAnswer: Math.max(0, (q.choices || q.answers || []).indexOf(q.correct || q.answer || '')),
                explanation: `The correct answer is ${q.correct || q.answer || 'Unknown'}`,
                points: 10
              }));
              console.log(`✅ Loaded ${allQuestions.length} questions from starter pack`);
            } else {
              console.log('Starter pack has no questions array');
            }
          } else {
            console.log('Starter pack document does not exist');
          }
        } catch (error) {
          console.log('❌ Starter pack error:', error);
        }
      } else {
        console.log(`Found ${allQuestions.length} questions from other sources`);
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
      
      // Return custom ads from Firebase (no API fallback needed)
      if (customAds.length > 0) {
        return customAds;
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
  return urlParams.get('haunt') || '';
}
