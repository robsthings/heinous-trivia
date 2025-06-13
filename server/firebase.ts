import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
};

// Initialize Firebase Admin SDK only if properly configured
let firebaseApp;
let firestore;
let storage;
let exportedFieldValue;

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
      const credential = cert(serviceAccount);

      firebaseApp = initializeApp({
        credential: credential,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      });
    } else {
      firebaseApp = getApps()[0];
    }
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    exportedFieldValue = FieldValue;
    // Firebase Admin SDK initialized successfully
  } catch (error) {
    // Firebase initialization failed - running without Firebase integration
    firestore = null;
    storage = null;
    exportedFieldValue = null;
  }
} else {
  // Firebase credentials not configured, running without Firebase integration
  firestore = null;
  storage = null;
  exportedFieldValue = null;
}

export { firestore, exportedFieldValue as FieldValue };

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

  static async uploadFile(buffer: Buffer, filename: string, path: string = '') {
    if (!storage) {
      throw new Error('Firebase Storage not configured - please provide Firebase credentials');
    }
    
    try {
      const bucket = storage.bucket();
      
      // Check if bucket exists and create if it doesn't
      try {
        await bucket.getMetadata();
      } catch (bucketError: any) {
        if (bucketError.code === 404) {
          console.log('Creating Firebase Storage bucket...');
          try {
            await bucket.create({
              location: 'us-central1',
              storageClass: 'STANDARD'
            });
            console.log('Firebase Storage bucket created successfully');
          } catch (createError: any) {
            throw new Error(`Failed to create Firebase Storage bucket: ${createError.message}. Please create the bucket "heinous-trivia.appspot.com" manually in your Firebase console.`);
          }
        } else {
          throw bucketError;
        }
      }
      
      const file = bucket.file(`${path}${filename}`);
      
      await file.save(buffer, {
        metadata: {
          contentType: filename.endsWith('.gif') ? 'image/gif' : 
                     filename.endsWith('.png') ? 'image/png' :
                     filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 
                     'application/octet-stream'
        },
        public: true
      });
      
      // Make file publicly readable
      await file.makePublic();
      
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${path}${filename}`;
      
      return {
        downloadURL,
        filename,
        path: path + filename
      };
    } catch (error: any) {
      console.error('Firebase Storage upload error:', error);
      
      // Provide specific error messages for common issues
      if (error.message?.includes('bucket does not exist')) {
        throw new Error('Firebase Storage bucket not found. Please create the bucket in your Firebase console.');
      }
      if (error.code === 403) {
        throw new Error('Firebase Storage access denied. Please check your Firebase credentials and bucket permissions.');
      }
      
      throw new Error(`Firebase Storage upload failed: ${error.message}`);
    }
  }

  static async saveBrandingAsset(assetId: string, assetData: any) {
    if (!firestore) {
      console.warn('Firebase not configured - branding asset not saved');
      return;
    }

    try {
      await firestore.collection('branding-assets').doc(assetId).set(assetData);
    } catch (error) {
      console.error('Error saving branding asset:', error);
      throw error;
    }
  }

  static async getBrandingAssets() {
    if (!firestore) {
      console.warn('Firebase not configured - returning empty branding assets');
      return { skins: [], progressBars: [] };
    }

    try {
      const snapshot = await firestore.collection('branding-assets').get();
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const skins = assets.filter(asset => asset.type === 'skin');
      const progressBars = assets.filter(asset => asset.type === 'progressBar');

      return { skins, progressBars };
    } catch (error) {
      console.error('Error getting branding assets:', error);
      return { skins: [], progressBars: [] };
    }
  }
}