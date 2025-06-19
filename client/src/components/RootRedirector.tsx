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
    console.log('RootRedirector - Initial render');
    console.log('RootRedirector - window.location:', window.location);
    console.log('RootRedirector - pathname:', window.location.pathname);
    console.log('RootRedirector - search:', window.location.search);
    console.log('RootRedirector - href:', window.location.href);
    
    // Parse URL to check for haunt query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const hauntId = urlParams.get('haunt');

    console.log('RootRedirector - URLSearchParams object:', urlParams);
    console.log('RootRedirector - All params:', Array.from(urlParams.entries()));
    console.log('RootRedirector - Extracted hauntId:', hauntId);

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