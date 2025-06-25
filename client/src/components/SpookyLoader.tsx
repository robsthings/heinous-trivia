import { useState, useEffect } from "react";
// CUSTOM SKIN & PROGRESS BAR LOGIC
import { CustomProgressBar } from "./CustomProgressBar";
import type { HauntConfig } from "@shared/schema";

interface SpookyLoaderProps {
  message?: string;
  showProgress?: boolean;
  hauntConfig?: HauntConfig | null | undefined;
}

export function SpookyLoader({ 
  message = "Summoning the Spirits...", 
  showProgress = false,
  hauntConfig 
}: SpookyLoaderProps) {
  const [dots, setDots] = useState("...");
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const spookyMessages = [
    "Awakening Dr. Heinous...",
    "Gathering dark energies...",
    "Preparing the haunted trivia...",
    "Conjuring questions from beyond...",
    "Opening the portal to horror...",
    message
  ];

  useEffect(() => {
    // Animate dots
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        if (prev === ".") return "..";
        return "...";
      });
    }, 500);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % spookyMessages.length);
    }, 1500);

    // Simulate progress if enabled
    let progressInterval: NodeJS.Timeout;
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 200);
    }

    return () => {
      clearInterval(dotInterval);
      clearInterval(messageInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [message, showProgress, spookyMessages.length]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f2937 0%, #581c87 50%, #7f1d1d 100%)'
    }}>
      {/* Floating orbs */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              animation: 'bounce 1s infinite',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div 
              style={{
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#f97316',
                borderRadius: '50%',
                opacity: 0.7,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: `${i * 0.3}s`
              }}
            />
          </div>
        ))}
      </div>

      {/* Main loader */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '0.75rem',
        boxShadow: '0 0 12px rgba(255, 0, 50, 0.1)',
        backdropFilter: 'blur(6px)',
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '28rem',
        width: '100%',
        margin: '0 1rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Haunt Logo or Default Icons */}
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          {hauntConfig?.logoPath ? (
            <div style={{ position: 'relative' }}>
              <img 
                src={hauntConfig.logoPath} 
                alt={hauntConfig.name || "Haunt Logo"}
                style={{
                  width: '6rem',
                  height: '6rem',
                  margin: '0 auto',
                  objectFit: 'contain',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '-1rem', right: '-1rem', bottom: '-1rem', left: '-1rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '-2rem', right: '-2rem', bottom: '-2rem', left: '-2rem',
                border: '1px solid rgba(251, 146, 60, 0.1)',
                borderRadius: '50%',
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}></div>
            </div>
          ) : (
            <div>
              <div style={{
                fontSize: '4rem',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}>💀</div>
              <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                fontSize: '4rem',
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                opacity: 0.3
              }}>👻</div>
              <div style={{
                position: 'absolute',
                top: '-1rem', right: '-1rem', bottom: '-1rem', left: '-1rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '-2rem', right: '-2rem', bottom: '-2rem', left: '-2rem',
                border: '1px solid rgba(251, 146, 60, 0.1)',
                borderRadius: '50%',
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}></div>
            </div>
          )}
        </div>

        {/* Loading text */}
        <h2 style={{
          fontSize: '1.5rem',
          color: '#f97316',
          marginBottom: '1rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          fontFamily: '"Creepster", cursive'
        }}>
          {spookyMessages[currentMessage]}{dots}
        </h2>

        {/* CUSTOM SKIN & PROGRESS BAR LOGIC */}
        {/* Custom or default progress bar based on haunt tier */}
        <CustomProgressBar
          progress={showProgress ? progress : 60}
          hauntConfig={hauntConfig}
          style={{ marginBottom: '1rem' }}
        />

        {/* Flickering candles */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div 
                style={{
                  fontSize: '1.5rem',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                🕯️
              </div>
              <div 
                style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0.25rem',
                  height: '0.25rem',
                  backgroundColor: '#fb923c',
                  borderRadius: '50%',
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                  opacity: 0.75,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            </div>
          ))}
        </div>

        {/* Creepy subtitle */}
        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          marginTop: '1rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          Preparing your descent into madness...
        </p>
      </div>

      {/* Corner spiders */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        fontSize: '1.5rem',
        animation: 'bounce 1s infinite',
        animationDelay: '1s'
      }}>
        🕷️
      </div>
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        fontSize: '1.5rem',
        animation: 'bounce 1s infinite',
        animationDelay: '1.5s'
      }}>
        🕸️
      </div>
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        fontSize: '1.5rem',
        animation: 'bounce 1s infinite',
        animationDelay: '2s'
      }}>
        🦇
      </div>
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        fontSize: '1.5rem',
        animation: 'bounce 1s infinite',
        animationDelay: '0.5s'
      }}>
        👁️
      </div>
    </div>
  );
}