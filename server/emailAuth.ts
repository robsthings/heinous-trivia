/**
 * Server-side Email Authentication Service
 * Handles Firebase email link authentication and authorization validation
 */
import { firestore, FieldValue } from './firebase';

export class ServerEmailAuthService {
  /**
   * Add authorized email to a haunt
   */
  static async addAuthorizedEmail(hauntId: string, email: string): Promise<boolean> {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const hauntRef = firestore.collection('haunts').doc(hauntId);
      const hauntDoc = await hauntRef.get();

      if (!hauntDoc.exists) {
        console.error('Haunt not found:', hauntId);
        return false;
      }

      const hauntData = hauntDoc.data();
      const currentEmails = hauntData?.authorizedEmails || [];
      
      // Add email if not already present
      if (!currentEmails.includes(email.toLowerCase())) {
        await hauntRef.update({
          authorizedEmails: FieldValue.arrayUnion(email.toLowerCase())
        });
        console.log(`Added authorized email ${email} to haunt ${hauntId}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to add authorized email:', error);
      return false;
    }
  }

  /**
   * Remove authorized email from a haunt
   */
  static async removeAuthorizedEmail(hauntId: string, email: string): Promise<boolean> {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const hauntRef = firestore.collection('haunts').doc(hauntId);
      await hauntRef.update({
        authorizedEmails: FieldValue.arrayRemove(email.toLowerCase())
      });
      
      console.log(`Removed authorized email ${email} from haunt ${hauntId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove authorized email:', error);
      return false;
    }
  }

  /**
   * Get all authorized emails for a haunt
   */
  static async getAuthorizedEmails(hauntId: string): Promise<string[]> {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const hauntRef = firestore.collection('haunts').doc(hauntId);
      const hauntDoc = await hauntRef.get();

      if (!hauntDoc.exists) {
        return [];
      }

      const hauntData = hauntDoc.data();
      return hauntData?.authorizedEmails || [];
    } catch (error) {
      console.error('Failed to get authorized emails:', error);
      return [];
    }
  }

  /**
   * Check if email is authorized for haunt access
   */
  static async isEmailAuthorized(hauntId: string, email: string): Promise<boolean> {
    try {
      const authorizedEmails = await this.getAuthorizedEmails(hauntId);
      return authorizedEmails.includes(email.toLowerCase());
    } catch (error) {
      console.error('Failed to check email authorization:', error);
      return false;
    }
  }

  /**
   * Initialize haunt with first authorized email (for setup)
   */
  static async initializeHauntAuth(hauntId: string, email: string): Promise<boolean> {
    try {
      if (!firestore) {
        throw new Error('Firebase not configured');
      }

      const hauntRef = firestore.collection('haunts').doc(hauntId);
      const hauntDoc = await hauntRef.get();

      if (!hauntDoc.exists) {
        console.error('Haunt not found:', hauntId);
        return false;
      }

      const hauntData = hauntDoc.data();
      
      // Only allow initialization if no auth method is set
      if (hauntData?.authCode || (hauntData?.authorizedEmails && hauntData.authorizedEmails.length > 0)) {
        console.error('Haunt already has authentication configured:', hauntId);
        return false;
      }

      // Set first authorized email
      await hauntRef.update({
        authorizedEmails: [email.toLowerCase()],
        updatedAt: new Date()
      });

      console.log(`Initialized haunt ${hauntId} with first authorized email: ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize haunt auth:', error);
      return false;
    }
  }
}