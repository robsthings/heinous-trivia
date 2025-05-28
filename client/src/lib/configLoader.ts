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
      return null;
    }
  }

  static async loadTriviaQuestions(haunt: string): Promise<TriviaQuestion[]> {
    try {
      // Always start with the starter pack (100+ questions base)
      const starterQuestions: TriviaQuestion[] = [];
      try {
        const starterPackRef = doc(firestore, 'trivia-packs', 'starter-pack');
        const starterPackDoc = await getDoc(starterPackRef);
        
        if (starterPackDoc.exists()) {
          const starterData = starterPackDoc.data();
          if (starterData && starterData.questions && Array.isArray(starterData.questions) && starterData.questions.length > 0) {
            // Normalize question format for consistency
            const normalizedQuestions = starterData.questions.map((q: any) => {
              const answerChoices = q.answers || q.choices || [];
              const correctAnswerText = q.correct || q.answer || q.correctAnswer;
              let correctAnswerIndex = 0;
              
              // Handle different correct answer formats
              if (typeof correctAnswerText === 'number') {
                correctAnswerIndex = correctAnswerText;
              } else if (typeof correctAnswerText === 'string') {
                correctAnswerIndex = Math.max(0, answerChoices.indexOf(correctAnswerText));
              }
              
              return {
                id: q.id || `starter-${Math.random()}`,
                text: q.question || q.text || 'Question text missing',
                category: "Horror",
                difficulty: 1,
                answers: answerChoices,
                correctAnswer: correctAnswerIndex,
                explanation: q.explanation || `The correct answer is ${answerChoices[correctAnswerIndex] || 'Unknown'}`,
                points: q.points || 10
              };
            });
            
            starterQuestions.push(...normalizedQuestions);
          }
        }
      } catch (error) {
        console.warn('Failed to load starter pack questions:', error);
      }
      
      // Load custom questions from Firebase (limited by tier)
      const customQuestions: TriviaQuestion[] = [];
      let customQuestionLimit = 5; // Default basic tier limit
      
      try {
        // Get haunt config to check tier
        const hauntRef = doc(firestore, 'haunts', haunt);
        const hauntSnap = await getDoc(hauntRef);
        
        if (hauntSnap.exists()) {
          const hauntData = hauntSnap.data();
          const tier = hauntData.tier || 'basic';
          
          // Set limits based on tier
          if (tier === 'premium') {
            customQuestionLimit = 50;
          } else if (tier === 'pro') {
            customQuestionLimit = 15;
          } else {
            customQuestionLimit = 5; // basic
          }
        }
        
        const questionsRef = collection(firestore, 'trivia-custom', haunt, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        
        let questionCount = 0;
        querySnapshot.forEach((doc) => {
          if (questionCount >= customQuestionLimit) return; // Respect tier limits
          
          const data = doc.data();
          const answerChoices = data.answers || data.choices || [];
          const correctAnswerText = data.correct || data.answer || data.correctAnswer;
          let correctAnswerIndex = 0;
          
          // Handle different correct answer formats
          if (typeof correctAnswerText === 'number') {
            correctAnswerIndex = correctAnswerText;
          } else if (typeof correctAnswerText === 'string') {
            correctAnswerIndex = Math.max(0, answerChoices.indexOf(correctAnswerText));
          }
          
          customQuestions.push({
            id: doc.id,
            text: data.question || data.text || 'Question text missing',
            category: "Custom",
            difficulty: 1,
            answers: answerChoices,
            correctAnswer: correctAnswerIndex,
            explanation: `The correct answer is ${answerChoices[correctAnswerIndex] || 'Unknown'}`,
            points: data.points || 10
          } as TriviaQuestion);
          questionCount++;
        });
      } catch (error) {
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
                  const normalizedPackQuestions = packData.questions.map((q: any) => {
                    const answerChoices = q.answers || q.choices || [];
                    const correctAnswerText = q.correct || q.answer || q.correctAnswer;
                    let correctAnswerIndex = 0;
                    
                    // Handle different correct answer formats
                    if (typeof correctAnswerText === 'number') {
                      correctAnswerIndex = correctAnswerText;
                    } else if (typeof correctAnswerText === 'string') {
                      correctAnswerIndex = Math.max(0, answerChoices.indexOf(correctAnswerText));
                    }
                    
                    return {
                      id: q.id || `pack-${packId}-${Math.random()}`,
                      text: q.question || q.text || 'Question text missing',
                      category: "Pack",
                      difficulty: 1,
                      answers: answerChoices,
                      correctAnswer: correctAnswerIndex,
                      explanation: `The correct answer is ${answerChoices[correctAnswerIndex] || 'Unknown'}`,
                      points: q.points || 10
                    };
                  });
                  packQuestions.push(...normalizedPackQuestions);
                }
              }
            } catch (packError) {
              // Failed to load pack, continue
            }
          }
        }
      } catch (error) {
        // Continue without pack questions
      }
      
      // Merge all question sources - starter pack provides the base
      let allQuestions = [...starterQuestions, ...customQuestions, ...packQuestions];
      
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
