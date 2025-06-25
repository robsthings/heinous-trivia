/**
 * Firebase Email Link Authentication Service
 * Handles passwordless authentication for haunt admin access
 */
import { auth, firestore } from '@/lib/firebase';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signOut 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface EmailAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

export class EmailAuthService {
  /**
   * Send email link for haunt admin authentication
   */
  static async sendEmailLink(email: string, hauntId: string): Promise<EmailAuthResult> {
    try {
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain must be in the authorized domains list.
        url: `${window.location.origin}/haunt-auth/${hauntId}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email and hauntId to localStorage for completing sign-in
      localStorage.setItem('emailForSignIn', email);
      localStorage.setItem('hauntIdForSignIn', hauntId);
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send email link:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send authentication email'
      };
    }
  }

  /**
   * Complete email link sign-in and validate haunt access
   */
  static async completeEmailSignIn(hauntId?: string): Promise<EmailAuthResult> {
    try {
      // Check if this is an email link sign-in
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        return { success: false, error: 'Invalid authentication link' };
      }

      // Get email from localStorage or prompt user
      let email = localStorage.getItem('emailForSignIn');
      const storedHauntId = localStorage.getItem('hauntIdForSignIn');
      
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      if (!email) {
        return { success: false, error: 'Email is required for authentication' };
      }

      // Use stored hauntId if not provided
      const targetHauntId = hauntId || storedHauntId;
      if (!targetHauntId) {
        return { success: false, error: 'Haunt ID is required for authentication' };
      }

      // Complete the sign-in
      const result = await signInWithEmailLink(auth, email, window.location.href);
      
      // Validate user has access to this haunt
      const hasAccess = await this.validateHauntAccess(email, targetHauntId);
      
      if (!hasAccess) {
        // Sign out the user since they don't have access
        await signOut(auth);
        return { 
          success: false, 
          error: `Email ${email} is not authorized for this haunt` 
        };
      }

      // Clean up localStorage
      localStorage.removeItem('emailForSignIn');
      localStorage.removeItem('hauntIdForSignIn');
      
      // Store successful authentication
      localStorage.setItem(`heinous-email-auth-${targetHauntId}`, email);
      localStorage.setItem(`heinous-email-auth-timestamp-${targetHauntId}`, Date.now().toString());

      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Failed to complete email sign-in:', error);
      return { 
        success: false, 
        error: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Validate if user email is authorized for haunt access
   */
  static async validateHauntAccess(email: string, hauntId: string): Promise<boolean> {
    try {
      // Check Firebase for haunt configuration
      const hauntRef = doc(firestore, 'haunts', hauntId);
      const hauntSnap = await getDoc(hauntRef);

      if (!hauntSnap.exists()) {
        console.error('Haunt not found:', hauntId);
        return false;
      }

      const hauntData = hauntSnap.data();
      const authorizedEmails = hauntData.authorizedEmails || [];

      // Check if email is in authorized list
      return authorizedEmails.includes(email.toLowerCase());
    } catch (error) {
      console.error('Failed to validate haunt access:', error);
      return false;
    }
  }

  /**
   * Check if user is currently authenticated for a haunt
   */
  static isAuthenticated(hauntId: string): boolean {
    const email = localStorage.getItem(`heinous-email-auth-${hauntId}`);
    const timestamp = localStorage.getItem(`heinous-email-auth-timestamp-${hauntId}`);
    
    if (!email || !timestamp) return false;

    // Check if authentication is still valid (24 hours)
    const authTime = parseInt(timestamp);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return (now - authTime) < twentyFourHours;
  }

  /**
   * Get authenticated user email for a haunt
   */
  static getAuthenticatedEmail(hauntId: string): string | null {
    if (!this.isAuthenticated(hauntId)) return null;
    return localStorage.getItem(`heinous-email-auth-${hauntId}`);
  }

  /**
   * Sign out user from haunt
   */
  static async signOutFromHaunt(hauntId: string): Promise<void> {
    // Clear localStorage
    localStorage.removeItem(`heinous-email-auth-${hauntId}`);
    localStorage.removeItem(`heinous-email-auth-timestamp-${hauntId}`);
    
    // Sign out from Firebase if no other haunts are authenticated
    const allKeys = Object.keys(localStorage);
    const hasOtherHauntAuth = allKeys.some(key => 
      key.startsWith('heinous-email-auth-') && 
      !key.includes('-timestamp-') && 
      key !== `heinous-email-auth-${hauntId}`
    );

    if (!hasOtherHauntAuth) {
      await signOut(auth);
    }
  }
}