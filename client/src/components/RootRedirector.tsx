import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Home from '@/pages/home';

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
    // Parse URL to check for haunt query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const hauntId = urlParams.get('haunt');

    // Only proceed if haunt parameter is present
    if (hauntId) {
      // Clear any existing haunt session data to prevent cross-contamination
      const previousHaunt = sessionStorage.getItem('currentHaunt');
      if (previousHaunt && previousHaunt !== hauntId) {
        // Switching haunts - clear all haunt-specific data
        sessionStorage.removeItem('fromWelcomeScreen');
        sessionStorage.removeItem('gameState');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`heinous-player-name-${previousHaunt}`)) {
            // Don't clear player names - they're haunt-specific and should persist
          }
        });
      }

      // Check if user has seen the intro before (same logic as Welcome screen)
      const hasSeenIntro = localStorage.getItem('hasSeenHeinousIntro');
      const isFirstVisit = !hasSeenIntro;

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