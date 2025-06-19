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
  
  // Extract haunt parameter from Wouter route params
  const params = new URLSearchParams();
  const pathSegments = location.split('/');
  let routeHauntId: string | null = null;
  
  // Check if we're on /h/:hauntId route
  if (pathSegments[1] === 'h' && pathSegments[2]) {
    routeHauntId = pathSegments[2];
  }

  useEffect(() => {
    // Priority 1: Use route parameter if on /h/:hauntId path
    let detectedHauntId = routeHauntId;
    
    // Priority 2: Use comprehensive URL detection if no route param
    if (!detectedHauntId) {
      detectedHauntId = extractHauntId();
    }
    
    console.log('RootRedirector - Route haunt:', routeHauntId);
    console.log('RootRedirector - Extracted haunt:', extractHauntId());
    console.log('RootRedirector - Final haunt:', detectedHauntId);
    console.log('RootRedirector - Current URL:', window.location.href);
    console.log('RootRedirector - Wouter location:', location);

    // Process valid haunt ID for Firebase isolation
    if (detectedHauntId && isValidHauntId(detectedHauntId)) {
      preserveHauntId(detectedHauntId);
      
      // Enforce haunt isolation through HauntSecurity
      HauntSecurity.enforceHauntIsolation(detectedHauntId);
      
      // Check if this is a first-time visit for this haunt
      const visitKey = `heinous-first-visit-${detectedHauntId}`;
      const isFirstVisit = !localStorage.getItem(visitKey);
      
      if (isFirstVisit) {
        localStorage.setItem(visitKey, 'true');
        navigate(`/welcome/${detectedHauntId}`);
        return;
      } else {
        navigate(`/game/${detectedHauntId}`);
        return;
      }
    }

    // If no valid haunt detected after all strategies, show homepage
    if (!detectedHauntId || !isValidHauntId(detectedHauntId)) {
      setShowHome(true);
    }
  }, [location, routeHauntId, navigate]);

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