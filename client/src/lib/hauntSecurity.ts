/**
 * Haunt Security Module
 * Prevents users from accessing wrong haunts and ensures clean session management
 */

export interface HauntSession {
  hauntId: string;
  timestamp: number;
  playerName?: string;
}

export class HauntSecurity {
  private static readonly SESSION_KEY = 'heinous_haunt_session';
  private static readonly ADMIN_PATHS = ['admin', 'haunt-admin', 'analytics', 'uber-admin'];

  /**
   * Sets the current haunt session and clears conflicting data
   */
  static setHauntSession(hauntId: string, playerName?: string): void {
    const previousSession = this.getCurrentSession();
    
    // If switching haunts, clear all session data
    if (previousSession && previousSession.hauntId !== hauntId) {
      this.clearSessionData(previousSession.hauntId);
    }

    const session: HauntSession = {
      hauntId,
      timestamp: Date.now(),
      playerName
    };

    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem('currentHaunt', hauntId);
  }

  /**
   * Gets the current haunt session
   */
  static getCurrentSession(): HauntSession | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Validates if user should have access to a specific haunt
   */
  static async validateHauntAccess(hauntId: string): Promise<boolean> {
    // Always allow headquarters access
    if (hauntId === 'headquarters') return true;

    try {
      const response = await fetch(`/api/haunt-config/${hauntId}`);
      if (response.ok) {
        const config = await response.json();
        return config && config.isActive !== false;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Extracts haunt ID from current URL using multiple detection strategies
   */
  static getHauntFromURL(): string {
    const pathParts = window.location.pathname.split('/');
    
    // Admin pages should not return haunt context
    if (pathParts.length >= 2 && this.ADMIN_PATHS.includes(pathParts[1])) {
      return 'headquarters'; // Safe default for admin contexts
    }

    // Strategy 1: Check URL path for /game/:hauntId or /welcome/:hauntId
    if (pathParts.length >= 3 && (pathParts[1] === 'game' || pathParts[1] === 'welcome')) {
      return pathParts[2];
    }
    
    // Strategy 2: Check path-based haunt detection (/h/HauntName)
    if (pathParts.length >= 3 && pathParts[1] === 'h') {
      return pathParts[2];
    }
    
    // Strategy 3: Check query parameter for QR code redirects
    const urlParams = new URLSearchParams(window.location.search);
    const queryHaunt = urlParams.get('haunt');
    if (queryHaunt) {
      return queryHaunt;
    }
    
    // Strategy 4: Hash-based parameters (production fallback)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash.includes('haunt=')) {
        const hashParams = new URLSearchParams(hash);
        const hashHaunt = hashParams.get('haunt');
        if (hashHaunt) return hashHaunt;
      }
      // Direct hash format: #HauntName
      else if (hash && !hash.includes('=') && hash.length > 2) {
        return hash;
      }
    }
    
    // Strategy 5: Check preserved haunt parameter
    const preservedHaunt = sessionStorage.getItem('preservedHauntParam');
    if (preservedHaunt) {
      return preservedHaunt;
    }
    
    // Fallback to session or default
    const session = this.getCurrentSession();
    return session?.hauntId || 'headquarters';
  }

  /**
   * Clears all session data for a specific haunt
   */
  static clearSessionData(hauntId?: string): void {
    if (hauntId) {
      // Clear haunt-specific localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.includes(`-${hauntId}-`) || key.endsWith(`-${hauntId}`)) {
          localStorage.removeItem(key);
        }
      });
    }

    // Clear session storage
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem('currentHaunt');
    sessionStorage.removeItem('fromWelcomeScreen');
    sessionStorage.removeItem('gameState');
  }

  /**
   * Enforces haunt isolation - call when switching between haunts
   */
  static enforceHauntIsolation(newHauntId: string): void {
    const currentSession = this.getCurrentSession();
    
    if (currentSession && currentSession.hauntId !== newHauntId) {
      console.log(`Switching from ${currentSession.hauntId} to ${newHauntId} - clearing session data`);
      this.clearSessionData(currentSession.hauntId);
    }
    
    this.setHauntSession(newHauntId);
  }

  /**
   * Checks if current path is an admin path
   */
  static isAdminPath(): boolean {
    const pathParts = window.location.pathname.split('/');
    return pathParts.length >= 2 && this.ADMIN_PATHS.includes(pathParts[1]);
  }

  /**
   * Safe redirect that maintains haunt isolation
   */
  static safeRedirect(path: string, hauntId?: string): void {
    if (hauntId) {
      this.enforceHauntIsolation(hauntId);
    }
    
    window.location.href = path;
  }
}

// Backwards compatibility exports
export const getHauntFromURL = () => HauntSecurity.getHauntFromURL();
export const validateHauntAccess = (hauntId: string) => HauntSecurity.validateHauntAccess(hauntId);
export const clearHauntSession = () => HauntSecurity.clearSessionData();