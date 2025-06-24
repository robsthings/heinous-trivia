/**
 * FIREBASE FIELD NAME REFERENCE: Check /fieldGlossary.json before modifying any Firebase operations
 * - Use 'haunt' for query parameters, 'hauntId' for Firebase document fields
 * - Use 'action' for ad interactions (NOT 'interactionType')
 * - Collections: game_sessions, ad_interactions (snake_case), haunt-ads (kebab-case)
 * - Verify all field names against canonical glossary before changes
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_PROJECT_ID);
};

// Initialize Firebase Admin SDK only if properly configured
let firebaseApp;
let firestore;
let storage;
let exportedFieldValue;

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        const credential = cert(serviceAccount);

        firebaseApp = initializeApp({
          credential: credential,
          databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`,
          storageBucket: `${serviceAccount.project_id}.firebasestorage.app`
        });
      } else {
        // Initialize with project ID only for development
        firebaseApp = initializeApp({
          projectId: 'heinous-trivia'
        });
      }
    } else {
      firebaseApp = getApps()[0];
    }
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    exportedFieldValue = FieldValue;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed - running without Firebase integration:', error.message);
    firestore = null;
    storage = null;
    exportedFieldValue = null;
  }
} else {
  console.log('Firebase not configured - running without Firebase integration');
  firestore = null;
  storage = null;
  exportedFieldValue = null;
}

export { firestore, exportedFieldValue as FieldValue };

// Collection references
export const COLLECTIONS = {
  HAUNTS: 'haunts',
  LEADERBOARDS: 'leaderboards',
  GAME_SESSIONS: 'game-sessions',
  AD_INTERACTIONS: 'ad-interactions',
  QUESTION_PERFORMANCE: 'question-performance'
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
    
    console.log(`🔥 Firebase Storage upload starting: ${path}${filename}`);
    
    try {
      const bucket = storage.bucket();
      
      // Verify bucket exists and is accessible
      try {
        const [metadata] = await bucket.getMetadata();
        console.log(`📦 Bucket verified: ${metadata.name}`);
      } catch (bucketError: any) {
        console.error('❌ Bucket verification failed:', bucketError);
        if (bucketError.code === 404) {
          throw new Error('Firebase Storage bucket not found. Please ensure the bucket exists in your Firebase console.');
        }
        if (bucketError.code === 403) {
          throw new Error('Firebase Storage access denied. Check your service account permissions.');
        }
        throw bucketError;
      }
      
      const file = bucket.file(`${path}${filename}`);
      
      // Enhanced content type detection
      const getContentType = (filename: string): string => {
        const ext = filename.toLowerCase().split('.').pop();
        switch (ext) {
          case 'gif': return 'image/gif';
          case 'png': return 'image/png';
          case 'jpg':
          case 'jpeg': return 'image/jpeg';
          case 'webp': return 'image/webp';
          case 'svg': return 'image/svg+xml';
          default: return 'application/octet-stream';
        }
      };
      
      const contentType = getContentType(filename);
      console.log(`📄 Content type: ${contentType}`);
      
      // Upload with enhanced metadata and CORS headers
      await file.save(buffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
          metadata: {
            uploadedAt: new Date().toISOString(),
            originalName: filename,
            uploadSource: 'uber-admin'
          }
        },
        public: true,
        resumable: false // For better reliability with smaller files
      });
      
      console.log(`✅ File uploaded successfully`);
      
      // Make file publicly readable with explicit permissions
      try {
        await file.makePublic();
        console.log(`🌐 File made public`);
      } catch (publicError: any) {
        console.warn('⚠️ Could not make file public, may already be public:', publicError.message);
        // Continue - file might already be public or have correct permissions
      }
      
      // Generate multiple URL formats for maximum compatibility
      const bucketName = bucket.name;
      const encodedPath = encodeURIComponent(path + filename);
      
      // Primary URL with alt=media for direct access
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
      
      // Verify URL accessibility
      console.log(`🔗 Generated URL: ${downloadURL}`);
      
      // Test URL accessibility (optional - can be removed for performance)
      try {
        const testResponse = await fetch(downloadURL, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log(`✅ URL verified accessible`);
        } else {
          console.warn(`⚠️ URL test returned ${testResponse.status}`);
        }
      } catch (testError) {
        console.warn('⚠️ URL verification failed (may still work):', testError);
      }
      
      return {
        downloadURL,
        filename,
        path: path + filename,
        bucketName,
        contentType
      };
    } catch (error: any) {
      console.error('❌ Firebase Storage upload error:', error);
      
      // Enhanced error handling with specific Firebase issues
      if (error.message?.includes('bucket does not exist') || error.message?.includes('bucket not found')) {
        throw new Error('Firebase Storage bucket not found. Please create the bucket in your Firebase console.');
      }
      
      if (error.code === 403 || error.message?.includes('access denied') || error.message?.includes('permission')) {
        throw new Error('Firebase Storage access denied. Please check your Firebase credentials and bucket permissions.');
      }
      
      if (error.code === 'storage/unauthorized') {
        throw new Error('Firebase Storage unauthorized. Please verify your service account has Storage Admin role.');
      }
      
      if (error.message?.includes('CORS')) {
        throw new Error('CORS configuration error. Please configure CORS for your Firebase Storage bucket.');
      }
      
      if (error.code === 'ENOTFOUND' || error.message?.includes('network')) {
        throw new Error('Network error connecting to Firebase Storage. Please check your internet connection.');
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

  static async deleteBrandingAsset(assetId: string) {
    if (!firestore) {
      throw new Error('Firebase not configured');
    }

    try {
      // Get the asset to determine file path for storage deletion
      const assetDoc = await firestore.collection('branding-assets').doc(assetId).get();
      
      if (!assetDoc.exists) {
        throw new Error('Asset not found');
      }

      const assetData = assetDoc.data();
      
      // Delete from Firebase Storage if URL exists
      if (assetData.url && storage) {
        try {
          // Extract file path from URL for Firebase Storage
          const urlParts = assetData.url.split('/');
          const fileName = urlParts[urlParts.length - 1].split('?')[0];
          const assetType = assetData.type === 'skin' ? 'skins' : 'progressBars';
          const filePath = `branding/${assetType}/${fileName}`;
          
          const bucket = storage.bucket();
          await bucket.file(filePath).delete();
        } catch (storageError) {
          console.warn('Could not delete file from storage:', storageError);
        }
      }

      // Delete from Firestore
      await firestore.collection('branding-assets').doc(assetId).delete();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting branding asset:', error);
      throw error;
    }
  }

  // Sidequest management methods
  static async saveSidequest(sidequestId: string, sidequestData: any) {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      await firestore.collection('sidequests').doc(sidequestId).set({
        ...sidequestData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error saving sidequest:', error);
      throw error;
    }
  }

  static async getSidequest(sidequestId: string) {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const doc = await firestore.collection('sidequests').doc(sidequestId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching sidequest:', error);
      throw error;
    }
  }

  static async getAllSidequests() {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const snapshot = await firestore.collection('sidequests').where('isActive', '==', true).get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching sidequests:', error);
      throw error;
    }
  }

  static async getSidequestsByTier(requiredTier: string) {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const tierHierarchy = { 'Basic': 0, 'Pro': 1, 'Premium': 2 };
      const userTierLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0;
      
      const snapshot = await firestore.collection('sidequests').where('isActive', '==', true).get();
      
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(sidequest => {
          const sidequestTierLevel = tierHierarchy[sidequest.requiredTier as keyof typeof tierHierarchy] || 0;
          return sidequestTierLevel <= userTierLevel;
        });
    } catch (error) {
      console.error('Error fetching sidequests by tier:', error);
      throw error;
    }
  }

  static async saveSidequestProgress(progressData: any) {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const progressId = `${progressData.hauntId}_${progressData.sidequestId}_${progressData.sessionId}`;
      
      await firestore.collection('sidequest-progress').doc(progressId).set({
        ...progressData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error saving sidequest progress:', error);
      throw error;
    }
  }

  static async getSidequestProgress(hauntId: string, sidequestId: string, sessionId: string) {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const progressId = `${hauntId}_${sidequestId}_${sessionId}`;
      const doc = await firestore.collection('sidequest-progress').doc(progressId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching sidequest progress:', error);
      throw error;
    }
  }
}