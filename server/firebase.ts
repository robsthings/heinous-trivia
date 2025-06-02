import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || 
    (process.env.VITE_FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL)
  );
};

// Initialize Firebase Admin SDK only if properly configured
let firebaseApp;
let firestore;

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      let credential;
      
      // Try using the complete JSON service account first
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = cert(serviceAccount);
      } else {
        // Fall back to individual environment variables
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
          privateKey = privateKey.replace(/^["']|["']$/g, '');
          privateKey = privateKey.replace(/\\n/g, '\n');
          privateKey = privateKey.trim();
        }
        
        credential = cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        });
      }

      firebaseApp = initializeApp({
        credential: credential,
        databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
      });
    } else {
      firebaseApp = getApps()[0];
    }
    firestore = getFirestore(firebaseApp);
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    firestore = null;
  }
} else {
  console.log('Firebase credentials not configured, running without Firebase integration');
  firestore = null;
}

export { firestore };

// Collection references
export const COLLECTIONS = {
  HAUNTS: 'haunts',
  LEADERBOARDS: 'leaderboards',
  GAME_SESSIONS: 'game_sessions',
  AD_INTERACTIONS: 'ad_interactions',
  QUESTION_PERFORMANCE: 'question_performance'
} as const;

// Helper functions for Firestore operations
export class FirebaseService {
  static async saveHauntConfig(hauntId: string, config: any) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    const docRef = firestore.collection(COLLECTIONS.HAUNTS).doc(hauntId);
    await docRef.set(config, { merge: true });
    return config;
  }

  static async getHauntConfig(hauntId: string) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    const docRef = firestore.collection(COLLECTIONS.HAUNTS).doc(hauntId);
    const doc = await docRef.get();
    return doc.exists ? doc.data() : null;
  }

  static async saveLeaderboardEntry(hauntId: string, entry: any) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    const leaderboardRef = firestore
      .collection(COLLECTIONS.LEADERBOARDS)
      .doc(hauntId)
      .collection('entries');
    
    const docRef = await leaderboardRef.add({
      ...entry,
      timestamp: new Date()
    });
    
    return { id: docRef.id, ...entry };
  }

  static async getLeaderboard(hauntId: string, limit: number = 10) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    const leaderboardRef = firestore
      .collection(COLLECTIONS.LEADERBOARDS)
      .doc(hauntId)
      .collection('entries')
      .orderBy('score', 'desc')
      .limit(limit);
    
    const snapshot = await leaderboardRef.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getAllHaunts() {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    const snapshot = await firestore.collection(COLLECTIONS.HAUNTS).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Analytics methods
  static async saveGameSession(hauntId: string, sessionData: any) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    const docRef = await firestore.collection(COLLECTIONS.GAME_SESSIONS).add({
      ...sessionData,
      hauntId,
      createdAt: new Date()
    });
    return { id: docRef.id, ...sessionData };
  }

  static async updateGameSession(sessionId: string, updates: any) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    await firestore.collection(COLLECTIONS.GAME_SESSIONS).doc(sessionId).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  static async saveAdInteraction(hauntId: string, interactionData: any) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    await firestore.collection(COLLECTIONS.AD_INTERACTIONS).add({
      ...interactionData,
      hauntId,
      createdAt: new Date()
    });
  }

  static async saveQuestionPerformance(hauntId: string, performanceData: any) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }
    await firestore.collection(COLLECTIONS.QUESTION_PERFORMANCE).add({
      ...performanceData,
      hauntId,
      createdAt: new Date()
    });
  }

  static async getAnalyticsData(hauntId: string, timeRange: string) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }

    const daysAgo = parseInt(timeRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get game sessions
    const sessionsSnapshot = await firestore
      .collection(COLLECTIONS.GAME_SESSIONS)
      .where('hauntId', '==', hauntId)
      .where('createdAt', '>=', startDate)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());

    // Get ad interactions
    const adSnapshot = await firestore
      .collection(COLLECTIONS.AD_INTERACTIONS)
      .where('hauntId', '==', hauntId)
      .where('createdAt', '>=', startDate)
      .get();

    const adInteractions = adSnapshot.docs.map(doc => doc.data());

    // Get question performance
    const questionSnapshot = await firestore
      .collection(COLLECTIONS.QUESTION_PERFORMANCE)
      .where('hauntId', '==', hauntId)
      .where('createdAt', '>=', startDate)
      .get();

    const questionData = questionSnapshot.docs.map(doc => doc.data());

    // Calculate analytics
    const totalGames = sessions.length;
    const uniquePlayers = new Set(sessions.map((s: any) => s.playerId)).size;
    const completedSessions = sessions.filter((s: any) => s.completedAt);
    const returnPlayers = sessions.filter((s: any) => 
      sessions.some((other: any) => other.playerId === s.playerId && other.createdAt < s.createdAt)
    );

    const adViews = adInteractions.filter((a: any) => a.interactionType === 'view').length;
    const adClicks = adInteractions.filter((a: any) => a.interactionType === 'click').length;

    const correctAnswers = questionData.filter((q: any) => q.isCorrect).length;
    const totalAnswers = questionData.length;

    return {
      totalGames,
      uniquePlayers,
      returnPlayerRate: uniquePlayers > 0 ? (returnPlayers.length / uniquePlayers) * 100 : 0,
      adClickThrough: adViews > 0 ? (adClicks / adViews) * 100 : 0,
      bestQuestions: [], // Would need more complex aggregation
      competitiveMetrics: {
        averageScore: completedSessions.length > 0 ? 
          completedSessions.reduce((sum: number, s: any) => sum + (s.finalScore || 0), 0) / completedSessions.length : 0,
        topScore: Math.max(...completedSessions.map((s: any) => s.finalScore || 0), 0),
        participationRate: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0
      },
      averageGroupSize: 1, // Would need group session tracking
      timeRangeData: {
        daily: [],
        weekly: []
      }
    };
  }
}