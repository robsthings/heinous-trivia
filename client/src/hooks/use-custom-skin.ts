import { useEffect } from "react";
import type { HauntConfig } from "@shared/schema";

// CUSTOM SKIN & PROGRESS BAR LOGIC
// Hook to apply custom background skins for Pro/Premium haunts
export function useCustomSkin(hauntConfig: HauntConfig | null | undefined) {
  useEffect(() => {
    if (!hauntConfig) return;

    // Only apply custom skins for Pro and Premium tiers
    const isPremiumTier = hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium';
    
    if (isPremiumTier && hauntConfig.skinUrl) {
      // Apply custom background skin globally
      document.body.style.setProperty('background-image', `url("${hauntConfig.skinUrl}")`, 'important');
      document.body.style.setProperty('background-size', 'cover', 'important');
      document.body.style.setProperty('background-position', 'center', 'important');
      document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
      document.body.style.setProperty('background-attachment', 'fixed', 'important');
      
      // Create global styles to make all components transparent
      const styleElement = document.getElementById('custom-skin-styles') || document.createElement('style');
      styleElement.id = 'custom-skin-styles';
      styleElement.innerHTML = `
        /* Make main containers transparent to show custom background */
        .min-h-screen,
        .bg-gray-900,
        .bg-gray-800,
        .bg-slate-900,
        [class*="bg-gray-9"],
        [class*="bg-slate-9"] {
          background-color: transparent !important;
        }
        
        /* Semi-transparent cards for readability */
        .bg-gray-800.rounded-lg,
        .bg-gray-700.rounded,
        .card,
        .trivia-card {
          background-color: rgba(31, 41, 55, 0.85) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Loader backgrounds */
        .spooky-loader,
        .loading-screen {
          background-color: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(5px);
        }
        
        /* Modal overlays */
        .modal-overlay,
        .dialog-overlay,
        .leaderboard-modal {
          background-color: rgba(0, 0, 0, 0.6) !important;
        }
        
        /* Enhanced text readability */
        .text-white,
        .text-gray-100 {
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }
        
        /* Button enhancements */
        .btn,
        button {
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `;
      
      if (!document.head.contains(styleElement)) {
        document.head.appendChild(styleElement);
      }
      
      // Clear root backgrounds
      const root = document.documentElement;
      root.style.setProperty('background', 'transparent', 'important');
    } else {
      // Remove custom skin and restore defaults
      document.body.style.removeProperty('background-image');
      document.body.style.removeProperty('background-size');
      document.body.style.removeProperty('background-position');
      document.body.style.removeProperty('background-repeat');
      document.body.style.removeProperty('background-attachment');
      
      // Remove global custom styles
      const styleElement = document.getElementById('custom-skin-styles');
      if (styleElement) {
        styleElement.remove();
      }
      
      // Reset root
      const root = document.documentElement;
      root.style.removeProperty('background');
    }
  }, [hauntConfig?.skinUrl, hauntConfig?.tier]);
}