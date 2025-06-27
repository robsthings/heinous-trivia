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
    
    // Debug logging removed for production performance

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
    <div 
      
      style={{
        background: 'linear-gradient(to bottom right, #1f2937, #581c87, #000000)'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #ef4444',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem auto',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <p style={{
          color: '#9ca3af',
          fontFamily: '"Creepster", cursive',
          fontSize: '1.125rem'
        }}>
          Summoning the darkness...
        </p>
      </div>
    </div>
  );
}