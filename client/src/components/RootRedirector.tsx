import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Home from '@/pages/home';
import { HauntSecurity } from '@/lib/hauntSecurity';

/**
 * RootRedirector Component
 * 
 * Handles QR code redirects from https://heinoustrivia.com/?haunt=headquarters
 * - Detects haunt query parameter on root page load
 * - Checks localStorage for first-time visit detection
 * - Redirects to /welcome/:hauntId for new users
 * - Redirects to /game/:hauntId for returning users
 */
export function RootRedirector() {
  const [, navigate] = useLocation();
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    // Multiple strategies to detect haunt parameter in production environment
    let hauntId: string | null = null;
    
    // Strategy 1: Standard URL parameters (for development and compatible hosts)
    const urlParams = new URLSearchParams(window.location.search);
    hauntId = urlParams.get('haunt');
    
    // Strategy 2: Hash-based parameters (fallback for production)
    // Support URLs like: https://heinoustrivia.com/#haunt=Sorcererslair
    if (!hauntId && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove #
      if (hash.includes('haunt=')) {
        const hashParams = new URLSearchParams(hash);
        hauntId = hashParams.get('haunt');
      }
      // Also support direct hash format: #Sorcererslair
      else if (hash && !hash.includes('=')) {
        hauntId = hash;
      }
    }
    
    // Strategy 3: Path-based haunt detection
    // Support URLs like: https://heinoustrivia.com/h/Sorcererslair
    const pathSegments = window.location.pathname.split('/');
    if (!hauntId && pathSegments[1] === 'h' && pathSegments[2]) {
      hauntId = pathSegments[2];
    }
    
    // Strategy 4: Check sessionStorage for preserved haunt parameter
    if (!hauntId) {
      hauntId = sessionStorage.getItem('preservedHauntParam');
    }
    
    console.log('RootRedirector - Detection strategies:');
    console.log('  - Query param:', urlParams.get('haunt'));
    console.log('  - Hash:', window.location.hash);
    console.log('  - Path:', window.location.pathname);
    console.log('  - SessionStorage:', sessionStorage.getItem('preservedHauntParam'));
    console.log('RootRedirector - Final hauntId:', hauntId);

    // If hauntId is detected, preserve it in sessionStorage for future navigation
    if (hauntId) {
      sessionStorage.setItem('preservedHauntParam', hauntId);
    }

    // Only proceed if haunt parameter is present
    if (hauntId) {
      // Enforce haunt isolation to prevent cross-contamination
      HauntSecurity.enforceHauntIsolation(hauntId);

      // Check if user has seen the intro before (same logic as Welcome screen)
      const hasSeenIntro = localStorage.getItem('hasSeenHeinousIntro');
      const isFirstVisit = !hasSeenIntro;

      console.log('RootRedirector - isFirstVisit:', isFirstVisit);
      console.log('RootRedirector - Will redirect to:', isFirstVisit ? `/welcome/${hauntId}` : `/game/${hauntId}`);

      // Clear the query parameter from URL without triggering reload
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Redirect based on visit history
      if (isFirstVisit) {
        // First-time user: show welcome screen
        navigate(`/welcome/${hauntId}`);
      } else {
        // Returning user: go directly to game
        navigate(`/game/${hauntId}`);
      }
    } else {
      // No haunt parameter: show homepage
      setShowHome(true);
    }
  }, [navigate]);

  // Show homepage if no haunt parameter
  if (showHome) {
    return <Home />;
  }

  // Show loading state while redirect logic executes
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400 font-creepster text-lg">
          Summoning the darkness...
        </p>
      </div>
    </div>
  );
}