import React, { useState, useEffect } from "react";
import type { GameState } from "@/lib/gameState";
import { AnalyticsTracker } from "@/lib/analytics";

interface InterstitialAdProps {
  gameState: GameState;
  onClose: () => void;
  onVisitAd: (link: string) => void;
}

export function InterstitialAd({ gameState, onClose, onVisitAd }: InterstitialAdProps) {
  const [showTransition, setShowTransition] = useState(true);
  const [adImageLoaded, setAdImageLoaded] = useState(false);
  
  // Track current ad index to ensure transition shows for each new ad
  const [lastAdIndex, setLastAdIndex] = useState(-1);

  // Safe data extraction with fallbacks
  const isValidAd = gameState.showAd && gameState.ads.length > 0;
  const currentAd = isValidAd ? gameState.ads[gameState.currentAdIndex % gameState.ads.length] : null;
  const adIndex = isValidAd ? gameState.currentAdIndex % gameState.ads.length : 0;
  const hauntLogoPath = gameState.currentHaunt ? `/haunts/${gameState.currentHaunt}/logo` : '';
  const logoSrc = gameState.hauntConfig?.logoPath || hauntLogoPath;

  // Preload the ad image - only when valid ad exists
  useEffect(() => {
    if (!currentAd) return;
    
    const imageSrc = currentAd.image || currentAd.imageUrl;
    if (imageSrc) {
      const img = new Image();
      img.onload = () => setAdImageLoaded(true);
      img.onerror = () => setAdImageLoaded(true); // Still proceed even if image fails
      img.src = imageSrc as string;
    } else {
      setAdImageLoaded(true); // No image to load
    }
  }, [currentAd?.image, currentAd?.imageUrl]);

  // Reset transition state when ad index changes (new ad appears)
  useEffect(() => {
    if (!isValidAd) return;
    
    const currentAdIndex = gameState.currentAdIndex % gameState.ads.length;
    
    // If this is a new ad (different index), reset transition
    if (currentAdIndex !== lastAdIndex) {
      setShowTransition(true);
      setLastAdIndex(currentAdIndex);
    }
  }, [gameState.currentAdIndex, gameState.ads.length, isValidAd, lastAdIndex]);

  // Handle transition timing - only when showing valid ad
  useEffect(() => {
    if (!isValidAd || !showTransition) return;
    
    // End transition after 1.8s (matching animation duration)
    const transitionTimer = setTimeout(() => {
      setShowTransition(false);
    }, 1800);

    return () => {
      clearTimeout(transitionTimer);
    };
  }, [isValidAd, showTransition]);
  
  // Track ad view when component mounts - only for valid ads
  useEffect(() => {
    if (!isValidAd || !currentAd || !gameState.currentHaunt) return;
    
    AnalyticsTracker.trackAdView(gameState.currentHaunt, adIndex, currentAd.id);
  }, [gameState.currentHaunt, adIndex, isValidAd, currentAd]);

  // Early return after all hooks have been called
  if (!isValidAd || !currentAd) {
    return null;
  }

  const handleVisitAd = () => {
    if (currentAd.link && currentAd.link !== '#' && currentAd.link.startsWith('http')) {
      AnalyticsTracker.trackAdClick(gameState.currentHaunt, adIndex, currentAd.id);
      onVisitAd(currentAd.link);
    }
  };

  // Check if we have a valid link
  const hasValidLink = currentAd.link && currentAd.link !== '#' && currentAd.link.startsWith('http');

  // Transition Component with logo animation
  if (showTransition) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: '#000000',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ position: 'relative' }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Haunt Logo"
              style={{
                width: '8rem',
                height: '8rem',
                objectFit: 'contain',
                animation: 'batman-logo-transition 1.8s ease-in-out'
              }}
            />
          ) : (
            <div
              style={{
                width: '8rem',
                height: '8rem',
                backgroundColor: '#dc2626',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                animation: 'batman-logo-transition 1.8s ease-in-out'
              }}
            >
              HT
            </div>
          )}
        </div>
        
        {/* CSS Animation for Batman-style logo transition with dramatic 3D zoom */}
        <style jsx>{`
          @keyframes batman-logo-transition {
            0% {
              transform: scale(0.2) rotate(0deg);
              opacity: 0;
              filter: blur(4px);
            }
            20% {
              transform: scale(2.5) rotate(180deg);
              opacity: 1;
              filter: blur(0px);
            }
            40% {
              transform: scale(4.5) rotate(360deg);
              opacity: 1;
              filter: blur(0px);
            }
            60% {
              transform: scale(6) rotate(540deg);
              opacity: 1;
              filter: blur(0px);
            }
            80% {
              transform: scale(3) rotate(640deg);
              opacity: 1;
              filter: blur(1px);
            }
            100% {
              transform: scale(0.1) rotate(720deg);
              opacity: 0;
              filter: blur(6px);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0, left: 0,
        zIndex: 50,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 75%, #533483 100%)',
        ...gameState.hauntConfig?.skinUrl ? {
          backgroundImage: `linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(22,33,62,0.9) 25%, rgba(15,52,96,0.9) 75%, rgba(83,52,131,0.9) 100%), url(${gameState.hauntConfig.skinUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{
          textAlign: 'center',
          padding: '1.5rem 1rem'
        }}>
          <h3 
            style={{
              fontFamily: '"Creepster", cursive',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              color: '#d4af37',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            A Message from Our Sponsors
          </h3>
        </div>
        
        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 1rem',
          gap: '1.5rem'
        }}>
          
          {/* Ad Image Container */}
          <div style={{
            width: '100%',
            maxWidth: '48rem'
          }}>
            <div
              style={{
                background: 'linear-gradient(145deg, #1e3c72 0%, #2a5298 100%)',
                border: '3px solid #00d4ff',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)',
                position: 'relative'
              }}
            >
              {/* Electric border effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  borderRadius: '9px',
                  background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                  opacity: '0.6',
                  animation: 'electric-flow 2s linear infinite'
                }}
              />
              
              <img
                src={currentAd.image || currentAd.imageUrl}
                alt={currentAd.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  position: 'relative',
                  zIndex: 1
                }}
                onError={(e) => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 800;
                  canvas.height = 400;
                  const ctx = canvas.getContext('2d');
                  
                  if (ctx) {
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(0, 0, 800, 400);
                    
                    ctx.strokeStyle = '#00d4ff';
                    ctx.lineWidth = 6;
                    ctx.strokeRect(3, 3, 794, 394);
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 48px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(currentAd.title || 'Advertisement', 400, 200);
                    
                    ctx.fillStyle = '#d4af37';
                    ctx.font = '28px Arial';
                    ctx.fillText(currentAd.description || 'Heinous Trivia Sponsor', 400, 250);
                    
                    if (currentAd.link && currentAd.link !== '#') {
                      ctx.fillStyle = '#00d4ff';
                      ctx.font = '20px Arial';
                      ctx.fillText('Visit our website for more info', 400, 300);
                    }
                  }
                  
                  e.currentTarget.src = canvas.toDataURL();
                }}
              />
            </div>
          </div>
          
          {/* Ad Title and Description */}
          <div style={{
            textAlign: 'center',
            maxWidth: '42rem'
          }}>
            <h4 
              style={{
                fontFamily: '"Creepster", cursive',
                fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                color: '#00d4ff',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                marginBottom: '1rem',
                letterSpacing: '1px'
              }}
            >
              {currentAd.title}
            </h4>
            <p 
              style={{
                color: '#e5e7eb',
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                lineHeight: '1.6',
                textAlign: 'center'
              }}
            >
              {currentAd.description}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{
          padding: '0 1rem 2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '28rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {hasValidLink && (
              <button
                onClick={handleVisitAd}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)';
                }}
              >
                Learn More
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '16px 24px',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                borderRadius: '8px',
                border: '2px solid #4b5563',
                fontSize: '1.125rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.borderColor = '#4b5563';
              }}
            >
              Continue Playing
            </button>
          </div>
        </div>
        
      </div>
      
      {/* CSS Animation for electric border */}
      <style jsx>{`
        @keyframes electric-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
