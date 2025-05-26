import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    process.env.VITE_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  );
};

// Initialize Firebase Admin SDK only if properly configured
let firebaseApp;
let firestore;

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
      });
    } else {
      firebaseApp = getApps()[0];
    }
    firestore = getFirestore(firebaseApp);
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
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
  LEADERBOARDS: 'leaderboards'
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
}