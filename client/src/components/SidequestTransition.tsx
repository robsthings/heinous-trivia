import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { HauntConfig } from "@shared/schema";

interface SidequestTransitionProps {
  hauntConfig: HauntConfig | null;
  onComplete?: () => void;
}

// Tier-based sidequest pools
const SIDEQUEST_TIERS = {
  basic: [
    'glory-grab',
    'wack-a-chupacabra', 
    'cryptic-compliments'
  ],
  pro: [
    'glory-grab',
    'wack-a-chupacabra',
    'wretched-wiring',
    'lab-escape',
    'curse-crafting'
  ],
  premium: [
    'chupacabra-challenge',
    'crime',
    'cryptic-compliments',
    'curse-crafting',
    'face-the-chupacabra',
    'glory-grab',
    'lab-escape',
    'monster-name-generator',
    'wack-a-chupacabra',
    'wretched-wiring'
  ]
} as const;

export function SidequestTransition({ hauntConfig, onComplete }: SidequestTransitionProps) {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<'transition' | 'loading'>('transition');

  useEffect(() => {
    // Start transition sequence
    const timer = setTimeout(() => {
      setPhase('loading');
      
      // Select random sidequest based on tier
      setTimeout(() => {
        const tier = hauntConfig?.tier || 'basic';
        const availableSidequests = SIDEQUEST_TIERS[tier];
        const randomIndex = Math.floor(Math.random() * availableSidequests.length);
        const selectedSidequest = availableSidequests[randomIndex];
        
        // Navigate to selected sidequest
        setLocation(`/sidequest/${selectedSidequest}`);
        
        if (onComplete) {
          onComplete();
        }
      }, 1500); // Additional loading time
    }, 2000); // Transition duration

    return () => clearTimeout(timer);
  }, [hauntConfig, setLocation, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000'
    }}>
      {/* Static noise background */}
      <img
        src="/sidequests/402107790_STATIC_NOISE_400.gif"
        alt="Static transition"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.8
        }}
      />
      
      {/* Side quest overlay */}
      {phase === 'transition' && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <img
            src="/sidequests/side-quest.png"
            alt="Side Quest"
            style={{
              width: 'clamp(200px, 40vw, 400px)',
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))'
            }}
          />
          
          <div style={{
            color: '#ffffff',
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '2px'
          }}>
            SUMMONING SIDE QUEST...
          </div>
        </div>
      )}
      
      {/* Loading phase */}
      {phase === 'loading' && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          color: '#ffffff',
          fontSize: 'clamp(1.2rem, 5vw, 2rem)',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: '3px',
          animation: 'flicker 0.5s ease-in-out infinite'
        }}>
          LOADING...
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.7; transform: scale(1); }
        }
        
        @keyframes flicker {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}