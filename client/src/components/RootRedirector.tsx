import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Home from '@/pages/home';
import { HauntSecurity } from '@/lib/hauntSecurity';
import { extractHauntId, preserveHauntId, isValidHauntId } from '@/lib/hauntUrls';

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
  const [location, navigate] = useLocation();
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    // Use robust haunt detection system with multiple URL format support
    const hauntId = extractHauntId();
    
    console.log('RootRedirector - Detected hauntId:', hauntId);
    console.log('RootRedirector - Current URL:', window.location.href);
    console.log('RootRedirector - Wouter location:', location);

    // Preserve valid haunt ID for navigation persistence
    if (hauntId && isValidHauntId(hauntId)) {
      preserveHauntId(hauntId);
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