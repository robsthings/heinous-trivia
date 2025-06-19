/**
 * Haunt URL Generation and Detection System
 * 
 * Provides multiple URL formats for haunt access to work around
 * production environment query parameter stripping issues.
 */

export interface HauntUrlFormats {
  query: string;      // ?haunt=Sorcererslair (preferred for development)
  hash: string;       // #haunt=Sorcererslair (fallback for production)
  path: string;       // /h/Sorcererslair (alternative for production)
  direct: string;     // #Sorcererslair (simplest fallback)
}

/**
 * Generate all URL formats for a haunt
 */
export function generateHauntUrls(hauntId: string, baseUrl: string = 'https://heinoustrivia.com'): HauntUrlFormats {
  return {
    query: `${baseUrl}/?haunt=${hauntId}`,
    hash: `${baseUrl}/#haunt=${hauntId}`,
    path: `${baseUrl}/h/${hauntId}`,
    direct: `${baseUrl}/#${hauntId}`
  };
}

/**
 * Extract haunt ID from current URL using multiple detection strategies
 */
export function extractHauntId(): string | null {
  // Strategy 1: Standard URL parameters (development/compatible hosts)
  const urlParams = new URLSearchParams(window.location.search);
  let hauntId = urlParams.get('haunt');
  if (hauntId) return hauntId;

  // Strategy 2: Hash-based parameters
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    if (hash.includes('haunt=')) {
      const hashParams = new URLSearchParams(hash);
      hauntId = hashParams.get('haunt');
      if (hauntId) return hauntId;
    }
    // Direct hash format
    else if (hash && !hash.includes('=') && hash.length > 2) {
      return hash;
    }
  }

  // Strategy 3: Path-based detection (/h/HauntName)
  const pathSegments = window.location.pathname.split('/');
  if (pathSegments[1] === 'h' && pathSegments[2]) {
    return pathSegments[2];
  }

  // Strategy 4: Wouter location for SPA routing
  const wouterLocation = window.location.pathname;
  const wouterSegments = wouterLocation.split('/');
  if (wouterSegments[1] === 'h' && wouterSegments[2]) {
    return wouterSegments[2];
  }

  // Strategy 5: SessionStorage preservation
  return sessionStorage.getItem('preservedHauntParam');
}

/**
 * Preserve haunt ID in sessionStorage for navigation persistence
 */
export function preserveHauntId(hauntId: string): void {
  sessionStorage.setItem('preservedHauntParam', hauntId);
}

/**
 * Clear preserved haunt ID (used when switching haunts)
 */
export function clearPreservedHauntId(): void {
  sessionStorage.removeItem('preservedHauntParam');
}

/**
 * Validate haunt ID format (alphanumeric, no special characters except dashes)
 */
export function isValidHauntId(hauntId: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(hauntId) && hauntId.length >= 2 && hauntId.length <= 50;
}