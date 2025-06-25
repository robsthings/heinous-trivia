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
      // Get the current domain for the redirect URL
      const currentDomain = window.location.origin;
      console.log('Current domain for email link:', currentDomain);
      
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain must be in the authorized domains list.
        url: `${currentDomain}/haunt-auth/${hauntId}`,
        handleCodeInApp: true,
      };

      console.log('Sending email link with settings:', actionCodeSettings);
      console.log('Firebase Auth object:', auth);
      console.log('Auth current user:', auth.currentUser);
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email and hauntId to localStorage for completing sign-in
      localStorage.setItem('emailForSignIn', email);
      localStorage.setItem('hauntIdForSignIn', hauntId);
      
      console.log('Email link sent successfully to:', email);
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
      console.log('Starting email sign-in completion for haunt:', hauntId);
      console.log('Current URL:', window.location.href);
      
      // Check if this is an email link sign-in
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        console.log('Not a valid sign-in link');
        return { success: false, error: 'Invalid authentication link' };
      }

      // Get email from localStorage or prompt user
      let email = localStorage.getItem('emailForSignIn');
      const storedHauntId = localStorage.getItem('hauntIdForSignIn');
      
      console.log('Stored email:', email);
      console.log('Stored haunt ID:', storedHauntId);
      
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

      console.log('Completing Firebase sign-in...');
      // Complete the sign-in
      const result = await signInWithEmailLink(auth, email, window.location.href);
      console.log('Firebase sign-in successful:', result.user?.email);
      
      // Validate user has access to this haunt
      console.log('Validating haunt access...');
      const hasAccess = await this.validateHauntAccess(email, targetHauntId);
      console.log('Haunt access validation result:', hasAccess);
      
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

      console.log('Authentication session stored successfully');
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
      console.log('Validating haunt access for email:', email, 'haunt:', hauntId);
      
      // Use server API for validation to ensure consistency
      const response = await fetch(`/api/haunt/${hauntId}/email-auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (!response.ok) {
        console.error('Server validation failed:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('Server validation result:', result);
      
      return result.authorized === true;
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